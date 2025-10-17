namespace FlipMemo.Models
{
    public class UserWord
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int WordId { get; set; }
        public Word Word { get; set; } = null!;

        public int Posuda { get; set; } //svaka posuda bi mogla negdje imati fiksni timeout
        public DateTime LastReviewed { get; set; }
        public DateTime NextReview { get; set; }    //ovo je vrijeme koje traje timeout posude
        public bool Learned { get; set; } = false;  //ne pojavljuje se više
    }
}
