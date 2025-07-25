import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Trash2, FileText, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
const MarkdownConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const {
    toast
  } = useToast();
  const convertToMarkdown = (text: string) => {
    try {
      if (!text.trim()) {
        setOutputText("");
        return;
      }
    const lines = text.split('\n');
    const convertedLines = lines.map((line, index) => {
      let processedLine = line;

      // Convert URLs and email addresses to markdown format
      // Match email addresses
      processedLine = processedLine.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, match => `[${match}](mailto:${match})`);

      // Match URLs starting with http:// or https://
      processedLine = processedLine.replace(/https?:\/\/[^\s]+/g, match => `[${match}](${match})`);

      // Match URLs starting with www.
      processedLine = processedLine.replace(/\bwww\.[^\s]+/g, match => `[${match}](http://${match})`);

      // Match domain-like patterns (example.com, example.co.uk, etc.)
      processedLine = processedLine.replace(/\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?\b(?!@)/g, match => {
        // Skip if it's already part of an email or URL
        if (processedLine.includes(`[${match}]`) || processedLine.includes(`@${match}`)) {
          return match;
        }
        return `[${match}](http://${match})`;
      });

      // First line (title) - make it bold if it's not already a numbered heading
      if (index === 0 && processedLine.trim()) {
        const isNumberedHeading = processedLine.match(/^(\d+)\.\s+(.+)$/);
        if (!isNumberedHeading) {
          return `**${processedLine}**`;
        }
      }

      // Match patterns like "1. Scope" or "2. Introduction" (main headings)
      const mainHeadingMatch = processedLine.match(/^(\d+)\.\s+(.+)$/);
      if (mainHeadingMatch) {
        // Check if previous line was a sub-numbering or non-numbered text
        if (index > 0) {
          const prevLine = lines[index - 1];
          const prevIsSubNumbering = prevLine.match(/^\d+\.\d+/);
          const prevIsNonNumbered = prevLine.trim() && !prevLine.match(/^\d+\./) && !prevLine.match(/^\d+\.\d+/);
          if (prevIsSubNumbering || prevIsNonNumbered) {
            return `\n**${mainHeadingMatch[1]}. ${mainHeadingMatch[2]}**`;
          }
        }
        return `**${mainHeadingMatch[1]}. ${mainHeadingMatch[2]}**`;
      }

      // Check if this line is a sub-numbering (like "1.1", "2.1") or non-numbered text
      const isSubNumbering = processedLine.match(/^\d+\.\d+/);
      const isNonNumbered = processedLine.trim() && !processedLine.match(/^\d+\./) && !processedLine.match(/^\d+\.\d+/);

      // Add line break before sub-numberings and non-numbered text (except for the first line)
      if (index > 0 && (isSubNumbering || isNonNumbered)) {
        return `\n${processedLine}`;
      }
      return processedLine;
    });
      setOutputText(convertedLines.join('\n'));
    } catch (err) {
      console.error("Markdown conversion failed:", err);
      toast({
        title: "Error",
        description: "Failed to convert text to markdown",
        variant: "destructive"
      });
    }
  };
  const handleInputChange = (value: string) => {
    setInputText(value);
    convertToMarkdown(value);
  };
  const copyToClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not available");
      }
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Markdown text copied to clipboard"
      });
    } catch (err) {
      console.error("Copy to clipboard failed:", err);
      toast({
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };
  const clearAll = () => {
    setInputText("");
    setOutputText("");
    toast({
      title: "Cleared",
      description: "All text has been cleared"
    });
  };
  return <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src={logo} 
              alt="Markdown Converter Logo" 
              className="h-16 w-16 drop-shadow-lg"
            />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Markdown Converter
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Convert plain text with numbered headings to markdown format. </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Input Panel */}
          <Card className="shadow-soft border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Plain Text Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="Enter your plain text here...&#10;&#10;Example:&#10;1. Introduction&#10;1.1 Overview&#10;1.2 Purpose&#10;2. Scope&#10;2.1 Project goals" value={inputText} onChange={e => handleInputChange(e.target.value)} className="min-h-[400px] resize-none border-border/50 focus:border-primary/30 transition-colors" />
              <div className="flex gap-2">
                <Button variant="modern" size="sm" onClick={clearAll} className="flex-1">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="shadow-soft border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Code className="h-5 w-5 text-primary" />
                  Markdown Output
                </CardTitle>
                <Button onClick={copyToClipboard} disabled={!outputText} size="sm" variant="outline">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-[400px] p-4 bg-muted/30 rounded-md border border-border/30 font-mono text-sm whitespace-pre-wrap overflow-auto">
                {outputText || <span className="text-muted-foreground italic">
                    Converted markdown will appear here...
                  </span>}
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} disabled={!outputText} className="flex-1">
                  <Copy className="h-4 w-4" />
                  Copy Markdown
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Example Section */}
        <Card className="mt-8 max-w-4xl mx-auto shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="text-center text-foreground">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Input (Plain Text):</h4>
                <div className="p-3 bg-muted/30 rounded border border-border/30 font-mono text-sm">
                  1. Introduction<br />
                  1.1 Overview<br />
                  1.2 Purpose<br />
                  2. Scope<br />
                  2.1 Project goals
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Output (Markdown):</h4>
                <div className="p-3 bg-muted/30 rounded border border-border/30 font-mono text-sm">
                  **1. Introduction**<br />
                  1.1 Overview<br />
                  1.2 Purpose<br />
                  **2. Scope**<br />
                  2.1 Project goals
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default MarkdownConverter;