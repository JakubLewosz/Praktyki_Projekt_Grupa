using System;

namespace backend.DTOs
{
    public class ThreadListDto
    {
        public int Id { get; set; }
        public string Temat { get; set; } = string.Empty;
        public string OstatniaWiadomoscAutor { get; set; } = string.Empty;
        public string OstatniaWiadomoscFragment { get; set; } = string.Empty;
        public DateTime OstatniaWiadomoscData { get; set; }
        public string GrupaNazwa { get; set; } = string.Empty;
    }
}