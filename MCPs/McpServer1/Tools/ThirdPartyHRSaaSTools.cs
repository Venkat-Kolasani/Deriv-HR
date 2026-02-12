using System;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using ModelContextProtocol.Server;

/// <summary>
/// Sample MCP tools for demonstration purposes.
/// These tools can be invoked by MCP clients to perform various operations.
/// </summary>
internal class ThirdPartyHRSaaSTools
{
    private readonly ILogger<ThirdPartyHRSaaSTools> _logger;

    public ThirdPartyHRSaaSTools(ILogger<ThirdPartyHRSaaSTools> logger)
    {
        _logger = logger;
    }
    [McpServerTool]
    [Description("Leave application for HR SaaS.")]
    public string CreateLeaveApplication()
    {
        _logger.LogInformation("CreateLeaveApplication method invoked");
        try
        {
            const string endpoint = "http://localhost:5005/leave";
            _logger.LogDebug("Targeting endpoint: {Endpoint}", endpoint);
            using var client = new HttpClient();

            var payload = new
            {
                employeeId = "12345",
                startDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                endDate = DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-dd"),
                reason = "Personal"
            };
            _logger.LogDebug("Leave application payload prepared: {@Payload}", payload);

            var json = JsonSerializer.Serialize(payload);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = client.PostAsync(endpoint, content).Result;
            _logger.LogInformation("Received response with status code: {StatusCode}", (int)response.StatusCode);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Leave application submitted successfully");
                return "Leave application submitted successfully.";
            }

            var errorMessage = $"Leave application failed: {(int)response.StatusCode} {response.ReasonPhrase}";
            _logger.LogWarning(errorMessage);
            return errorMessage;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while submitting leave application");
            return $"Error submitting leave application: {ex.Message}";
        }
    }
}
