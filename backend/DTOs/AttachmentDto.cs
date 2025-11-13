namespace backend.DTOs
{
    public class AttachmentDto
    {
        public int Id { get; set; }
        public string OryginalnaNazwa { get; set; } = string.Empty;
        public string SciezkaPliku { get; set; } = string.Empty; // np. "/uploads/guid.pdf"
        public string TypMIME { get; set; } = string.Empty;
        public long Rozmiar { get; set; }
    }
}