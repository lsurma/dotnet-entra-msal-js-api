using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.Json;

namespace RazorPagesApp.Pages;

[Authorize]
public class WeatherModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WeatherModel> _logger;

    public WeatherModel(IHttpClientFactory httpClientFactory, ILogger<WeatherModel> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public List<WeatherForecast>? WeatherData { get; set; }

    public async Task OnGetAsync()
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            
            // Copy the authentication cookie to the request
            var cookies = Request.Cookies;
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var request = new HttpRequestMessage(HttpMethod.Get, $"{baseUrl}/api/weather/internal");
            
            // Copy cookies
            var cookieHeader = string.Join("; ", cookies.Select(c => $"{c.Key}={c.Value}"));
            if (!string.IsNullOrEmpty(cookieHeader))
            {
                request.Headers.Add("Cookie", cookieHeader);
            }

            var response = await client.SendAsync(request);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                WeatherData = JsonSerializer.Deserialize<List<WeatherForecast>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            else
            {
                _logger.LogWarning("Failed to fetch weather data: {StatusCode}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching weather data");
        }
    }
}

public class WeatherForecast
{
    public DateOnly Date { get; set; }
    public int TemperatureC { get; set; }
    public int TemperatureF { get; set; }
    public string? Summary { get; set; }
}
