using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);

// --- Rejestracja Usług ---

// 1. Pobieramy connection string (teraz do SQLite)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Rejestrujemy DbContext
//
//    NAJWAŻNIEJSZA ZMIANA: Mówimy EF Core, aby używał UseSqlite()
//
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

// 3. Rejestrujemy system Tożsamości (Identity)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
    .AddEntityFrameworkStores<ApplicationDbContext>();

// 4. Rejestrujemy Kontrolery
builder.Services.AddControllers();

// 5. Rejestrujemy Swaggera
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// --- Budujemy aplikację ---
var app = builder.Build();

// --- Konfiguracja "Rurociągu" (Pipeline) HTTP ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();