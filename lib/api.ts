import { secureFetch } from "@/utils/secureFetch";

export async function fetchVenues() {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/`);
  if (!res.ok) throw new Error("Failed to fetch venues");
  return res.json();
}

export async function fetchVenueById(id: string) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/getvenuebyid/${id}`);
  if (!res.ok) throw new Error("Failed to fetch venue");
  return res.json();
}

export async function fetchEvents() {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/events/`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchEventById(id: string) {
  const res = await secureFetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}