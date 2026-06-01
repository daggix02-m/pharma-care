export interface SectionEditorProps {
  content: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
  saving: boolean;
}
