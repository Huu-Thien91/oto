namespace oto.MyModels
{
    public class Booking
    {
        public int CarId { get; set; }
        public string CustomerName { get; set; }
        public string Phone { get; set; }
        public DateTime BookingDate { get; set; }
        public string BookingTime { get; set; }
        public string? Note { get; set; }
    }
}
