export interface BookingData {
  trustFeatures: Array<{
    title: string;
  }>;
}

export const bookingData: BookingData = {
  trustFeatures: [
    { title: 'NABL Accredited' },
    { title: 'ICMR Approved' },
    { title: 'Secure Booking' },
    { title: 'Trusted by 50,000+ Patients' },
  ],
};
