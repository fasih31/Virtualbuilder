
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, X, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'code' | 'url';
  size: number;
}

interface DocumentContextManagerProps {
  onContextUpdate?: (documents: Document[]) => void;
}

export default function DocumentContextManager({ onContextUpdate }: DocumentContextManagerProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocType, setNewDocType] = useState<'text' | 'code' | 'url'>('text');

  const addDocument = () => {
    if (!newDocName || !newDocContent) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and content",
        variant: "destructive"
      });
      return;
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      name: newDocName,
      content: newDocContent,
      type: newDocType,
      size: new Blob([newDocContent]).size
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    setNewDocName('');
    setNewDocContent('');

    if (onContextUpdate) {
      onContextUpdate(updatedDocs);
    }

    toast({
      title: "Document Added!",
      description: `${newDocName} added to context`
    });
  };

  const removeDocument = (id: string) => {
    const updatedDocs = documents.filter(d => d.id !== id);
    setDocuments(updatedDocs);

    if (onContextUpdate) {
      onContextUpdate(updatedDocs);
    }

    toast({
      title: "Document Removed",
      description: "Document removed from context"
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        content: content,
        type: file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.py') ? 'code' : 'text',
        size: file.size
      };

      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);

      if (onContextUpdate) {
        onContextUpdate(updatedDocs);
      }

      toast({
        title: "File Uploaded!",
        description: `${file.name} added to context`
      });
    };

    reader.readAsText(file);
  };

  const getTotalSize = () => {
    return documents.reduce((sum, doc) => sum + doc.size, 0);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Document Context
          </h3>
          <p className="text-sm text-muted-foreground">
            {documents.length} documents • {formatBytes(getTotalSize())}
          </p>
        </div>
        <label htmlFor="file-upload">
          <Button variant="outline" size="sm" asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </span>
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.md,.js,.ts,.py,.html,.css,.json"
          />
        </label>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <Label>Document Name</Label>
            <Input
              placeholder="e.g., API Documentation"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              placeholder="Paste your document content here..."
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={newDocType === 'text' ? 'default' : 'outline'}
              onClick={() => setNewDocType('text')}
            >
              Text
            </Button>
            <Button
              size="sm"
              variant={newDocType === 'code' ? 'default' : 'outline'}
              onClick={() => setNewDocType('code')}
            >
              Code
            </Button>
            <Button
              size="sm"
              variant={newDocType === 'url' ? 'default' : 'outline'}
              onClick={() => setNewDocType('url')}
            >
              URL
            </Button>
          </div>
          <Button onClick={addDocument} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add to Context
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {documents.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No documents added yet</p>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{doc.name}</h4>
                    <Badge variant="outline">{doc.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {doc.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(doc.size)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeDocument(doc.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {documents.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-primary" />
            <span className="font-semibold">Context Ready</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI will use these {documents.length} documents to provide more accurate and contextual responses
          </p>
        </Card>
      )}
    </div>
  );
}
