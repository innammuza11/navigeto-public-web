export type TourEnquirySelection = {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  adults?: number;
  children?: number;
  preferred_departure?: string;
  hotel_style?: string;
};

/** Keep the customer's choices distinct from supplier availability or a quote. */
export function tourEnquiryDetails(selection: TourEnquirySelection | null, input: {
  adults: unknown; children: unknown; departure: string; hotelStyle: string;
}, today: string) {
  const title = selection?.title?.trim() || selection?.name?.trim();
  if (!selection?.slug || !title) throw new Error("Please choose your tour before sending an enquiry.");
  const count = (value: unknown, minimum: number) => {
    if (value === "" || value == null) throw new Error("Please enter your traveller counts.");
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < minimum || number > 100) throw new Error("Please enter valid traveller counts (up to 100 per group).");
    return number;
  };
  const adults = count(input.adults, 1);
  const children = count(input.children, 0);
  if (adults + children > 100) throw new Error("Please contact Navigeto directly for groups larger than 100.");
  const departure = input.departure.trim();
  if (departure) {
    const parsed = new Date(`${departure}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(departure) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== departure || departure < today) {
      throw new Error("Please choose today or a future departure date, or leave it blank if flexible.");
    }
  }
  if (!["Boutique", "Luxury", "Essential"].includes(input.hotelStyle)) throw new Error("Please choose your preferred hotel style.");
  return {
    subject: `tour request: ${title}`,
    pax: adults + children,
    ...(departure ? { travel_start_date: departure } : {}),
    details: {
      selection: { id: selection.id, slug: selection.slug, title, adults, children, preferred_departure: departure, hotel_style: input.hotelStyle },
      adults, children, hotel_style: input.hotelStyle,
      dates_flexible: !departure,
      quotation_type: "standard",
    },
  };
}
