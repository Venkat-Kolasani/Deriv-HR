var builder = WebApplication.CreateBuilder(args);

// Bind the application to a specific port. Change the port number as needed.
builder.WebHost.UseUrls("http://localhost:5005");

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.MapPost("/leave", (ILogger<Program> logger) =>
{
    logger.LogInformation("Leave application endpoint called");
    var response = new { message = "Leave application submitted successfully." };
    logger.LogInformation("Returning leave application response: {@Response}", response);
    return Results.Json(response);
})
.WithName("leave");

app.MapGet("/mcp", () =>
{
    var tools = new[]
    {
        new Tool("runSubagent", "Launches a subagent to perform multi-step tasks"),
        new Tool("fetch_webpage", "Fetches web page content"),
        new Tool("read_file", "Reads a file from the workspace"),
        new Tool("apply_patch", "Edits files in the workspace")
    };
    return Results.Json(tools);
})
.WithName("GetMcpTools");

app.Run();

record Tool(string Name, string Description);

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
