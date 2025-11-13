namespace backend.DTOs
{
    public class AuthorDto
    {
        public string Id { get; set; } = string.Empty;
        public string NazwaWyswietlana { get; set; } = string.Empty; // np. "Bank Testowy" lub "UKNF"
        public string Rola { get; set; } = string.Empty;
    }
}