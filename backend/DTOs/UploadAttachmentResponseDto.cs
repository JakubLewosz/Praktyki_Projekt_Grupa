namespace backend.DTOs
{
    public class UploadAttachmentResponseDto
    {
        public int Id { get; set; }
        public string OryginalnaNazwa { get; set; } = string.Empty;
        // Zwracamy też ścieżkę, aby frontend mógł zbudować URL
        public string SciezkaPliku { get; set; } = string.Empty; 
    }
}