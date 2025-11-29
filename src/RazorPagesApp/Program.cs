using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.UI;

var builder = WebApplication.CreateBuilder(args);

// Add authentication with Microsoft Identity Platform
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"));

// Add JWT Bearer authentication for API endpoints
builder.Services.AddAuthentication()
    .AddJwtBearer("Bearer", options =>
    {
        var azureAdSection = builder.Configuration.GetSection("AzureAd");
        options.Authority = $"{azureAdSection["Instance"]}{azureAdSection["TenantId"]}/v2.0";
        options.Audience = azureAdSection["ClientId"];
        options.TokenValidationParameters.ValidateIssuer = true;
    });

// Configure authorization
builder.Services.AddAuthorization(options =>
{
    // Default policy requires authenticated users
    var defaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.DefaultPolicy = defaultPolicy;
    
    // Policy for API endpoints (Bearer token)
    options.AddPolicy("ApiPolicy", policy =>
        policy.AddAuthenticationSchemes("Bearer")
              .RequireAuthenticatedUser());
});

// Add services for Razor Pages with Microsoft Identity UI
builder.Services.AddRazorPages()
    .AddMicrosoftIdentityUI();

// Configure CORS for React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add controllers for API endpoints
builder.Services.AddControllers();

// Add HTTP client factory for internal API calls
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();
app.UseRouting();

// Enable CORS
app.UseCors("ReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

app.Run();
