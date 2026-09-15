'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { GameFieldEditor } from './GameFieldEditor';
import type { Game, GameField } from '@/types/game';

type Props = {
  game: Game & { game_fields: GameField[] };
};

export function GameEditForm({ game }: Props) {
  const router = useRouter();
  const [ชื่อเกม, setชื่อเกม] = useState(game.name);
  const [คำอธิบาย, setคำอธิบาย] = useState(game.description || '');
  const [หมวด, setหมวด] = useState(game.category || 'อื่นๆ');
  const [fields, setFields] = useState<GameField[]>(game.game_fields || []);
  const [กำลังส่ง, setกำลังส่ง] = useState(false);
  const [ข้อความ, setข้อความ] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setกำลังส่ง(true);
    setข้อความ(null);
    try {
      const res = await fetch('/api/admin/games/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: game.id,
          name: ชื่อเกม,
          description: คำอธิบาย,
          category: หมวด,
          game_fields: fields.map(f => ({
            id: f.id.startsWith('temp-') || f.id.startsWith('preset-') ? undefined : f.id,
            key: f.key,
            label: f.label,
            type: f.type,
            placeholder: f.placeholder,
            required: f.required,
            sort_order: f.sort_order,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) setข้อความ(data.message ?? 'ไม่สำเร็จ');
      else {
        setข้อความ('บันทึกแล้ว');
        router.refresh();
        setTimeout(() => setข้อความ(null), 2000);
      }
    } catch {
      setข้อความ('เชื่อมต่อไม่สำเร็จ');
    }
    setกำลังส่ง(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <h2 className="font-semibold text-sm">แก้ไขเกม: {game.name}</h2>
      
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="ชื่อเกม"
          value={ชื่อเกม}
          onChange={(e) => setชื่อเกม(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          placeholder="หมวด เช่น MOBA"
          value={หมวด}
          onChange={(e) => setหมวด(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          placeholder="คำอธิบาย"
          value={คำอธิบาย}
          onChange={(e) => setคำอธิบาย(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500 sm:col-span-2"
        />
      </div>

      <GameFieldEditor gameId={game.id} fields={fields} onChange={setFields} />

      <button
        type="submit"
        disabled={กำลังส่ง}
        className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"
      >
        {กำลังส่ง && <Loader2 className="h-4 w-4 animate-spin" />}
        บันทึก
      </button>
      {ข้อความ && <p className={`text-xs ${ข้อความ.includes('สำเร็จ') ? 'text-green-400' : 'text-zinc-400'}`}>{ข้อความ}</p>}
    </form>
  );
}
