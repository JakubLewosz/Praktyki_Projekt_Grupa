using System.Collections.Generic;

namespace backend.DTOs
{
    public class UpdateUserGroupsDto
    {
        public List<int> GrupyIds { get; set; } = new List<int>();
    }
}