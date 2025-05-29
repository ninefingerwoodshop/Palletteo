// src/app/components/EntryEditor.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useDatabase } from "../hooks/useDatabase";
import { marked } from "marked";

interface EntryData {
  id?: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

interface EntryEditorProps {
  entry?: EntryData;
  onSave: (entry: EntryData) => void;
  onCancel: () => void;
}

export default function EntryEditor({
  entry,
  onSave,
  onCancel,
}: EntryEditorProps) {
  const [formData, setFormData] = useState<EntryData>({
    title: entry?.title || "",
    content: entry?.content || "",
    tags: entry?.tags || [],
    category: entry?.category || "General",
    isPublic: entry?.isPublic || false,
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { isConnected } = useDatabase();

  const isEditing = !!entry?.id;

  // Predefined categories for style guide entries
  const categories = [
    "General",
    "Colors",
    "Typography",
    "Components",
    "Layout",
    "Icons",
    "Brand Guidelines",
    "Code Snippets",
    "Best Practices",
    "Templates",
  ];

  // Common tags for suggestions
  const commonTags = [
    "primary",
    "secondary",
    "accent",
    "neutral",
    "button",
    "form",
    "navigation",
    "card",
    "typography",
    "heading",
    "body-text",
    "spacing",
    "grid",
    "layout",
    "brand",
    "logo",
    "color-palette",
    "responsive",
    "mobile",
    "desktop",
    "accessibility",
    "contrast",
    "hover",
    "animation",
    "transition",
    "shadow",
    "border",
    "radius",
    "gradient",
  ];

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, content: e.target.value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, category: e.target.value }));
  };

  const handlePublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isPublic: e.target.checked }));
  };

  // Tag management
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleTagSuggestionClick = (tag: string) => {
    addTag(tag);
  };

  // Rich text formatting helpers
  const insertFormatting = (format: string) => {
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.slice(start, end);

    let replacement = "";
    switch (format) {
      case "bold":
        replacement = `**${selectedText}**`;
        break;
      case "italic":
        replacement = `*${selectedText}*`;
        break;
      case "code":
        replacement = `\`${selectedText}\``;
        break;
      case "codeblock":
        replacement = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
      case "h1":
        replacement = `# ${selectedText}`;
        break;
      case "h2":
        replacement = `## ${selectedText}`;
        break;
      case "h3":
        replacement = `### ${selectedText}`;
        break;
      case "link":
        replacement = `[${selectedText}](url)`;
        break;
      case "list":
        replacement = `- ${selectedText}`;
        break;
      default:
        return;
    }

    const newContent =
      textarea.value.slice(0, start) + replacement + textarea.value.slice(end);

    setFormData((prev) => ({ ...prev, content: newContent }));

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + replacement.length,
        start + replacement.length
      );
    }, 0);
  };
  const escapeHtml = (text: string): string => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };
  const escapeHtmlSafe = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };
  const renderMarkdownWithLibrary = (content: string) => {
    // Configure marked for security
    const renderer = new marked.Renderer();

    // Override link renderer for security
    renderer.link = ({ href, title, text }) => {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" ${
        title ? `title="${title}"` : ""
      }>${text}</a>`;
    };

    return marked(content, {
      renderer,
      breaks: true, // Convert line breaks to <br>
      gfm: true, // GitHub Flavored Markdown
    });
  };
  // Render markdown preview (basic)
  const renderMarkdownPreview = (content: string) => {
    let html = content;

    // Code blocks first (to avoid conflicts with inline formatting)
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code (after code blocks to avoid conflicts)
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headers
    html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");

    // Bold and italic (order matters)
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Lists (improved handling)
    html = html.replace(/^- (.+$)/gm, "<li>$1</li>");
    // Wrap consecutive <li> elements in <ul> tags
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, function (match) {
      // Only wrap if not already inside a <ul>
      if (!/^<ul>/.test(match)) {
        return `<ul>${match}</ul>`;
      }
      return match;
    });

    // Line breaks
    html = html.replace(/\n/g, "<br>");

    return html;
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const entryToSave: EntryData = {
        ...formData,
        updatedAt: new Date(),
        ...(isEditing ? { id: entry!.id } : { createdAt: new Date() }),
      };

      onSave(entryToSave);
    } catch (err: any) {
      setError(err.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  const suggestedTags = commonTags
    .filter(
      (tag) =>
        !formData.tags.includes(tag) && tag.includes(tagInput.toLowerCase())
    )
    .slice(0, 8);

  return (
    <div className="entry-editor">
      <div className="entry-editor__header">
        <h2>{isEditing ? "Edit Entry" : "Create New Entry"}</h2>
        <div className="header-actions">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="btn-secondary"
          >
            {previewMode ? "Edit" : "Preview"}
          </button>
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !isConnected}
            className="btn-primary"
          >
            {loading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="entry-editor__body">
        <div className="entry-sidebar">
          {/* Entry Metadata */}
          <div className="meta-section">
            <h3>Entry Details</h3>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter entry title..."
                className="title-input"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="category-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={handlePublicChange}
                />
                <span className="checkmark"></span>
                Make this entry public
              </label>
            </div>
          </div>

          {/* Tags Section */}
          <div className="tags-section">
            <h3>Tags</h3>

            <div className="tag-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Add tags..."
                className="tag-input"
              />
              <button
                onClick={() => addTag(tagInput)}
                className="add-tag-btn"
                disabled={!tagInput.trim()}
              >
                Add
              </button>
            </div>

            {/* Tag Suggestions */}
            {tagInput && suggestedTags.length > 0 && (
              <div className="tag-suggestions">
                <small>Suggestions:</small>
                <div className="suggested-tags">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagSuggestionClick(tag)}
                      className="suggested-tag"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Tags */}
            <div className="current-tags">
              {formData.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="remove-tag"
                    title="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="entry-content">
          {!previewMode ? (
            <>
              {/* Rich Text Toolbar */}
              <div className="rich-text-toolbar">
                <button
                  onClick={() => insertFormatting("bold")}
                  className="toolbar-btn"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  onClick={() => insertFormatting("italic")}
                  className="toolbar-btn"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <div className="toolbar-divider"></div>
                <button
                  onClick={() => insertFormatting("h1")}
                  className="toolbar-btn"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  onClick={() => insertFormatting("h2")}
                  className="toolbar-btn"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  onClick={() => insertFormatting("h3")}
                  className="toolbar-btn"
                  title="Heading 3"
                >
                  H3
                </button>
                <div className="toolbar-divider"></div>
                <button
                  onClick={() => insertFormatting("code")}
                  className="toolbar-btn"
                  title="Inline Code"
                >
                  {"<>"}
                </button>
                <button
                  onClick={() => insertFormatting("codeblock")}
                  className="toolbar-btn"
                  title="Code Block"
                >
                  {"{}"}
                </button>
                <div className="toolbar-divider"></div>
                <button
                  onClick={() => insertFormatting("link")}
                  className="toolbar-btn"
                  title="Link"
                >
                  🔗
                </button>
                <button
                  onClick={() => insertFormatting("list")}
                  className="toolbar-btn"
                  title="List"
                >
                  •
                </button>
              </div>

              {/* Content Editor */}
              <textarea
                ref={contentRef}
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Enter your content here... You can use Markdown formatting."
                className="content-editor"
                rows={20}
              />

              <div className="editor-help">
                <small>
                  💡 Tip: Use **bold**, *italic*, `code`, # headings, - lists,
                  and [links](url) for rich formatting
                </small>
              </div>
            </>
          ) : (
            /* Preview Mode */
            <div className="content-preview">
              <h3>Preview</h3>
              <div
                className="preview-content"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownPreview(formData.content),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
