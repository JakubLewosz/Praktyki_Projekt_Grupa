using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer; // <-- NOWY Using
using Microsoft.IdentityModel.Tokens; // <-- NOWY Using
using System.Text; // <-- NOWY Using

var builder = WebApplication.CreateBuilder(args);

// --- Rejestracja Usług ---

// 1. Pobieramy connection string (do SQLite)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Rejestrujemy DbContext (z UseSqlite)
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


// 4. NOWA SEKCJA: Rejestrujemy Autentykację JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Na razie false, dla deweloperki
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});


// 5. Rejestrujemy Kontrolery
builder.Services.AddControllers();

// 6. Rejestrujemy Swaggera (i dodajemy obsługę JWT w UI)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    // To doda kłódkę "Authorize" w interfejsie Swaggera
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Wprowadź token JWT (np. 'Bearer 12345abcdef')"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


// --- Budujemy aplikację ---
var app = builder.Build();

// --- Konfiguracja "Rurociągu" (Pipeline) HTTP ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// WAŻNE: Dodajemy CORS - aby Angular mógł się łączyć
// To pozwala na żądania z localhost:4200 (domyślny port Angulara)
app.UseCors(policy => 
    policy.WithOrigins("http://localhost:4200")
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthentication(); // Musi być przed UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();