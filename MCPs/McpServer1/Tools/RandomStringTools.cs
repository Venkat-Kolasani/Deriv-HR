using System.ComponentModel;
using ModelContextProtocol.Server;

/// <summary>
/// Sample MCP tools for demonstration purposes.
/// These tools can be invoked by MCP clients to perform various operations.
/// </summary>
internal class RandomStringTools
{
    [McpServerTool]
    [Description("Generates a random string from a predefined secret list.")]
    public string GetRandomString()
    {
        var secretStrings = new[]
        {
        "apple", "banana", "cherry", "date", "elderberry", "fig", "grape"
        };
        return secretStrings[Random.Shared.Next(0, secretStrings.Length)];
    }

    [McpServerTool]
    [Description("Just a second tool.")]
    public string AnotherTool()
    {
        var secretStrings = new[]
        {
        "apple", "banana", "cherry", "date", "elderberry", "fig", "grape"
        };
        return secretStrings[Random.Shared.Next(0, secretStrings.Length)];
    }

    [McpServerTool]
    [Description("Just a third tool.")]
    public string ThirdTool()
    {
        var secretStrings = new[]
        {
        "apple", "banana", "cherry", "date", "elderberry", "fig", "grape"
        };
        return secretStrings[Random.Shared.Next(0, secretStrings.Length)];
    }
}
