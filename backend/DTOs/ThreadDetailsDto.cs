using System.Collections.Generic;

namespace backend.DTOs
{
    public class ThreadDetailsDto
    {
        public int Id { get; set; }
        public string Temat { get; set; } = string.Empty;
        public string GrupaNazwa { get; set; } = string.Empty;
        public List<MessageDto> Wiadomosci { get; set; } = new List<MessageDto>();
    }
}