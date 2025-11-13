using backend.Models;
using Microsoft.AspNetCore.Identity;

namespace backend.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            // Pobieramy usługi, których potrzebujemy
            // UserManager jest do zarządzania użytkownikami (z Identity)
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            // ApplicationDbContext jest do sprawdzania bazy danych
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

            // Upewnij się, że baza danych jest stworzona
            // (technicznie niepotrzebne jeśli robiliśmy 'database update', ale bezpieczne)
            context.Database.EnsureCreated();

            // Sprawdzamy, czy w bazie jest JAKIKOLWIEK użytkownik
            if (!userManager.Users.Any())
            {
                // Jeśli nie, tworzymy naszego pierwszego Admina
                var adminUser = new ApplicationUser
                {
                    UserName = "admin@uknf.pl",
                    Email = "admin@uknf.pl",
                    Rola = RolaUzytkownika.AdminUKNF,
                    EmailConfirmed = true // Ważne, aby pominąć potwierdzenie emaila
                };

                // Tworzymy użytkownika z hasłem
                var result = await userManager.CreateAsync(adminUser, "SuperHaslo123!");

                if (!result.Succeeded)
                {
                    // Jeśli coś pójdzie nie tak, wyświetl błędy w konsoli
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"Błąd Seeder: {error.Description}");
                    }
                }
            }
        }
    }
}