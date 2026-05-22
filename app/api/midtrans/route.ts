import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const IS_PRODUCTION = process.env.NODE_ENV === "production" && process.env.MIDTRANS_IS_PRODUCTION === "true";

const MIDTRANS_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

interface CartItemPayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variantName?: string;
  isSubscription?: boolean;
  subscriptionFrequency?: string;
}

interface CustomerPayload {
  name: string;
  phone: string;
  email: string;
}

interface ShippingAddressPayload {
  address: string;
  province: string;
  cityName: string;
  cityId: string;
  postalCode: string;
  serviceName: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, shippingAddress, totalAmount, shippingCost, discountAmount, couponDiscountAmount, couponCode } = body as {
      items: CartItemPayload[];
      customer: CustomerPayload;
      shippingAddress: ShippingAddressPayload;
      totalAmount: number;
      shippingCost: number;
      discountAmount?: number;
      couponDiscountAmount?: number;
      couponCode?: string;
    };

    if (!items || items.length === 0 || !customer || !shippingAddress || !totalAmount) {
      return NextResponse.json({ error: "Missing required checkout parameters" }, { status: 400 });
    }

    // Generate unique order ID
    const orderId = `NEXA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create order record in Supabase
    // Format shipping address for Supabase Orders table
    const orderAddress = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: shippingAddress.address,
      province: shippingAddress.province,
      city: shippingAddress.cityName,
      city_id: shippingAddress.cityId,
      postal_code: shippingAddress.postalCode,
      shipping_cost: shippingCost,
      shipping_service: shippingAddress.serviceName,
      coupon_code: couponCode || null,
      coupon_discount: couponDiscountAmount || 0,
      bundle_discount: discountAmount || 0,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.isSubscription ? Math.round(i.price * 0.9) : i.price,
        quantity: i.quantity,
        variant: i.variantName || null,
        isSubscription: i.isSubscription || false,
        subscriptionFrequency: i.subscriptionFrequency || null
      }))
    };

    const { error: dbError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          id: orderId,
          total_amount: totalAmount,
          payment_status: "pending",
          shipping_status: "pending",
          shipping_address: orderAddress
        }
      ]);

    if (dbError) {
      console.error("Database insert error:", dbError.message);
      // Continue even if database fails, but log it
    }

    // Process subscriptions if any are present
    const subscriptionItems = items.filter((i) => i.isSubscription);
    if (subscriptionItems.length > 0) {
      for (const subItem of subscriptionItems) {
        const nextBillingDate = new Date();
        const days = subItem.subscriptionFrequency === "60 days" ? 60 : subItem.subscriptionFrequency === "90 days" ? 90 : 30;
        nextBillingDate.setDate(nextBillingDate.getDate() + days);

        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .insert([
            {
              product_id: subItem.id,
              frequency: subItem.subscriptionFrequency || "30 days",
              next_billing_date: nextBillingDate.toISOString(),
              status: "active"
            }
          ]);

        if (subError) {
          console.error("Subscription create error:", subError.message);
        }
      }
    }

    // 2. Call Midtrans API if key is present
    if (!MIDTRANS_SERVER_KEY) {
      console.warn("Midtrans Server Key is missing. Returning Sandbox Mock session.");
      return NextResponse.json({
        token: `mock-snap-token-${orderId}`,
        redirect_url: `/checkout/success?order_id=${orderId}&mock_payment=true`,
        order_id: orderId,
        isMock: true
      });
    }

    const authHeader = `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`;

    // Map cart items to Midtrans format
    const itemDetails = items.map((i) => {
      const unitPrice = i.isSubscription ? i.price * 0.9 : i.price;
      return {
        id: i.id,
        price: Math.round(unitPrice),
        quantity: i.quantity,
        name: i.name.substring(0, 50) // limit name length for Midtrans
      };
    });

    // Add shipping cost as an item line in Midtrans
    if (shippingCost > 0) {
      itemDetails.push({
        id: "shipping-fee",
        price: shippingCost,
        quantity: 1,
        name: `Shipping (${shippingAddress.serviceName})`
      });
    }

    // Add discount as a negative item line
    if (discountAmount && discountAmount > 0) {
      itemDetails.push({
        id: "discount",
        price: -discountAmount,
        quantity: 1,
        name: "Bundle Discount"
      });
    }

    // Add coupon discount as a negative item line
    if (couponDiscountAmount && couponDiscountAmount > 0) {
      itemDetails.push({
        id: "coupon-discount",
        price: -couponDiscountAmount,
        quantity: 1,
        name: `Coupon: ${couponCode || "PROMO"}`
      });
    }

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(totalAmount)
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone,
        shipping_address: {
          first_name: customer.name,
          phone: customer.phone,
          address: shippingAddress.address,
          city: shippingAddress.cityName,
          postal_code: shippingAddress.postalCode,
          country_code: "IDN"
        }
      },
      enabled_payments: ["qris", "bank_transfer", "gopay", "shopeepay", "credit_card"],
      credit_card: {
        secure: true
      }
    };

    const midtransRes = await fetch(MIDTRANS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify(payload)
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok) {
      throw new Error(midtransData.error_messages?.join(", ") || "Midtrans API error");
    }

    return NextResponse.json({
      token: midtransData.token,
      redirect_url: midtransData.redirect_url,
      order_id: orderId
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Payment charge endpoint error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to initiate payment" }, { status: 500 });
  }
}
