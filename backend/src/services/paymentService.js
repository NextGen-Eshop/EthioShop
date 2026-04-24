import axios from "axios";

const CHAPA_URL = "https://api.chapa.co/v1/transaction/initialize";
const VERIFY_URL = "https://api.chapa.co/v1/transaction/verify";

export const initializePayment = async (order, user) => {
  const tx_ref = `ethioshop-${Date.now()}`;

  const response = await axios.post(
    CHAPA_URL,
    {
      amount: order.totalPrice,
      currency: "ETB",
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      tx_ref,
      callback_url: `${process.env.BASE_URL}/api/payment/verify/${tx_ref}`,
      return_url: `${process.env.BASE_URL}/payment-success`,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
    }
  );

  return {
    checkout_url: response.data.data.checkout_url,
    tx_ref,
  };
};

export const verifyPayment = async (tx_ref) => {
  const response = await axios.get(`${VERIFY_URL}/${tx_ref}`, {
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    },
  });

  return response.data;
};