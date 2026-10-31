import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Link as LinkIcon
} from 'lucide-react';

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

type ToolItem =
  | { type: 'separator' }
  | {
      type?: never;
      icon: React.ReactNode;
      cmd: string;
      val?: string;
      label: string;
      prompt?: boolean;
      disabled?: boolean;
    };

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  canUndo = true,
  canRedo = true
}) => {
  const tools: ToolItem[] = [
    { icon: <Bold className="w-4 h-4" />, cmd: 'bold', label: 'Bold (Ctrl+B)' },
    { icon: <Italic className="w-4 h-4" />, cmd: 'italic', label: 'Italic (Ctrl+I)' },
    { icon: <Strikethrough className="w-4 h-4" />, cmd: 'strikeThrough', label: 'Strikethrough' },
    { type: 'separator' },
    { icon: <Heading1 className="w-4 h-4" />, cmd: 'formatBlock', val: 'h2', label: 'Heading 1' },
    { icon: <Heading2 className="w-4 h-4" />, cmd: 'formatBlock', val: 'h3', label: 'Heading 2' },
    { type: 'separator' },
    { icon: <List className="w-4 h-4" />, cmd: 'insertUnorderedList', label: 'Bullet List' },
    { icon: <ListOrdered className="w-4 h-4" />, cmd: 'insertOrderedList', label: 'Numbered List' },
    { icon: <Quote className="w-4 h-4" />, cmd: 'formatBlock', val: 'blockquote', label: 'Quote' },
    { icon: <Code className="w-4 h-4" />, cmd: 'formatBlock', val: 'pre', label: 'Code Block' },
    { type: 'separator' },
    {
      icon: <LinkIcon className="w-4 h-4" />,
      cmd: 'createLink',
      prompt: true,
      label: 'Insert Link'
    },
    { type: 'separator' },
    { icon: <Undo className="w-4 h-4" />, cmd: 'undo', label: 'Undo (Ctrl+Z)', disabled: !canUndo },
    { icon: <Redo className="w-4 h-4" />, cmd: 'redo', label: 'Redo (Ctrl+Y)', disabled: !canRedo }
  ];

  return (
    <div className="flex items-center flex-wrap gap-1 p-1.5 bg-[#F6F8FC] dark:bg-[#151F30] border border-[#E9EDF5] dark:border-[#283655] rounded-xl mb-4 select-none">
      {tools.map((tool, index) => {
        if (tool.type === 'separator') {
          return (
            <div
              key={`sep-${index}`}
              className="w-[1px] h-4 bg-[#D5DDEB] dark:bg-[#283655] mx-1"
            />
          );
        }

        return (
          <button
            key={tool.cmd + (tool.val || index)}
            onClick={() => {
              if (tool.prompt) {
                const url = window.prompt('Enter link URL:', 'https://');
                if (url) onFormat('createLink', url);
              } else {
                onFormat(tool.cmd, tool.val);
              }
            }}
            disabled={tool.disabled}
            className={`p-1.5 rounded-lg text-[#5A6E8C] dark:text-[#94A3B8] hover:text-[#142039] dark:hover:text-white hover:bg-white dark:hover:bg-[#1E2B44] transition-colors ${
              tool.disabled ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            title={tool.label}
            aria-label={tool.label}
          >
            {tool.icon}
          </button>
        );
      })}
    </div>
  );
};
