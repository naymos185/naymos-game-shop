'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import type { GameField } from '@/types/game';
import { FIELD_PRESETS, FIELD_PRESET_GROUPS } from '@/types/game';

type Props = {
  gameId: string;
  fields: GameField[];
  onChange: (fields: GameField[]) => void;
};

type FieldFormData = Omit<GameField, 'id' | 'game_id'> & { id?: string };

export function GameFieldEditor({ gameId, fields, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FieldFormData | null>(null);
  const [loading, setLoading] = useState(false);

  function addField() {
    const newField: FieldFormData = {
      key: '',
      label: '',
      type: 'text',
      placeholder: '',
      required: true,
      sort_order: fields.length,
    };
    setEditingId('new');
    setFormData(newField);
  }

  function startEdit(field: GameField) {
    setEditingId(field.id);
    setFormData({ ...field });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData(null);
  }

  function saveField() {
    if (!formData || !formData.key.trim() || !formData.label.trim()) {
      alert('กรุณากรอก Key และ Label');
      return;
    }

    if (editingId === 'new') {
      const newField: GameField = {
        id: `temp-${Date.now()}`,
        game_id: gameId,
        ...formData,
        key: formData.key.toLowerCase().trim(),
      };
      onChange([...fields, newField]);
    } else if (editingId) {
      const updated = fields.map((f) =>
        f.id === editingId
          ? { ...f, ...formData, key: formData.key.toLowerCase().trim() }
          : f
      );
      onChange(updated);
    }
    cancelEdit();
  }

  function deleteField(id: string) {
    if (confirm('ลบช่องกรอกนี้?')) {
      onChange(fields.filter((f) => f.id !== id));
    }
  }

  function applyPreset(presetKey: keyof typeof FIELD_PRESET_GROUPS) {
    const presetGroup = FIELD_PRESET_GROUPS[presetKey];
    const newFields = presetGroup.map((p, idx) => ({
      id: `preset-${Date.now()}-${idx}`,
      game_id: gameId,
      ...p,
      placeholder: p.placeholder || p.label,
      required: true,
      sort_order: fields.length + idx,
    }));
    onChange([...fields, ...newFields]);
  }

  function moveField(fromIdx: number, toIdx: number) {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIdx, 1);
    newFields.splice(toIdx, 0, movedField);
    newFields.forEach((f, idx) => {
      f.sort_order = idx;
    });
    onChange(newFields);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">ช่องข้อมูลผู้เล่น</h3>
        <button
          type="button"
          onClick={addField}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          เพิ่มช่อง
        </button>
      </div>

      {fields.length === 0 && editingId !== 'new' && (
        <div className="text-xs text-zinc-400 text-center py-4">ยังไม่มีช่องกรอก เพิ่มช่องใหม่ได้ที่ปุ่มด้านบน</div>
      )}

      <div className="space-y-2">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          >
            <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab" />
            <div className="flex-1 text-xs">
              <div className="font-medium text-zinc-200">
                {field.label} <span className="text-zinc-500">({field.key})</span>
              </div>
              <div className="text-zinc-400">
                {field.type} {field.required ? '(บังคับ)' : '(ไม่บังคับ)'}
              </div>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => startEdit(field)}
                className="rounded px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
              >
                แก้ไข
              </button>
              <button
                type="button"
                onClick={() => deleteField(field.id)}
                className="rounded px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId && formData && (
        <div className="rounded-lg border border-blue-600 bg-blue-900/20 p-4 space-y-3">
          <h4 className="font-semibold text-sm text-blue-300">
            {editingId === 'new' ? 'เพิ่มช่องใหม่' : 'แก้ไขช่อง'}
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Key *</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="uid, zone_id, riot_id"
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Label *</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="UID / Player ID"
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">ประเภท</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-white"
              >
                <option value="text">ข้อความ</option>
                <option value="number">ตัวเลข</option>
                <option value="password">รหัสผ่าน</option>
                <option value="select">เลือก</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="rounded border-zinc-600"
                />
                บังคับกรอก
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Placeholder</label>
            <input
              type="text"
              value={formData.placeholder || ''}
              onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              placeholder="เช่น กรอก UID"
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveField}
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <details className="text-xs">
        <summary className="cursor-pointer font-medium text-zinc-400 hover:text-zinc-300">Preset</summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => applyPreset('uid_only')}
            className="rounded bg-zinc-700 hover:bg-zinc-600 px-2 py-1 text-xs text-zinc-200"
          >
            UID เพียงอย่างเดียว
          </button>
          <button
            type="button"
            onClick={() => applyPreset('id_password')}
            className="rounded bg-zinc-700 hover:bg-zinc-600 px-2 py-1 text-xs text-zinc-200"
          >
            ID + Password
          </button>
          <button
            type="button"
            onClick={() => applyPreset('uid_zone')}
            className="rounded bg-zinc-700 hover:bg-zinc-600 px-2 py-1 text-xs text-zinc-200"
          >
            UID + Zone ID
          </button>
          <button
            type="button"
            onClick={() => applyPreset('open_id')}
            className="rounded bg-zinc-700 hover:bg-zinc-600 px-2 py-1 text-xs text-zinc-200"
          >
            Open ID
          </button>
          <button
            type="button"
            onClick={() => applyPreset('valorant')}
            className="rounded bg-zinc-700 hover:bg-zinc-600 px-2 py-1 text-xs text-zinc-200"
          >
            Valorant
          </button>
          <button
            type="button"
            onClick={() => applyPreset('genshin')}
            className="rounded bg-zinc-700 hover:bg-zinc-600 px-2 py-1 text-xs text-zinc-200"
          >
            Genshin
          </button>
        </div>
      </details>
    </div>
  );
}
