using System.Collections.Generic;

namespace backend.DTOs
{
    public class CreateKnfThreadDto
    {
        public string Temat { get; set; } = string.Empty;
        public string Tresc { get; set; } = string.Empty;
        
        // Listy adresatów
        public List<int> GrupyIds { get; set; } = new List<int>();   // Broadcasty
        public List<int> PodmiotyIds { get; set; } = new List<int>(); // Wiadomości bezpośrednie

        public List<int> ZalacznikIds { get; set; } = new List<int>();
    }
}