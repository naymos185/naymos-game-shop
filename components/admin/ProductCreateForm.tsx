'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type GameOpt = { id: string; name: string };

export function ProductCreateForm({ games }: { games: GameOpt[] }) {
  const router = useRouter();
  const [gameId, setGameId] = useState(games[0]?.id ?? '');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('0');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: gameId,
          name,
          price: Number(price),
          cost: Number(cost) || 0,
          amount: amount === '' ? null : Number(amount),
        }),
      });
      const data = await res.json();
      if (!data.success) setMsg(data.message ?? 'ไม่สำเร็จ');
      else {
        setMsg('เพิ่มแพ็กแล้ว');
        setName('');
        setPrice('');
        setCost('0');
        setAmount('');
        router.refresh();
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  if (games.length === 0) {
    return (
      <p className="text-sm text-zinc-500">ยังไม่มีเกม — เพิ่มเกมหรือรัน seed ก่อน</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <h2 className="font-semibold text-sm">เพิ่มแพ็กเกจใหม่</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <select
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500 sm:col-span-2"
        >
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          required
          placeholder="ชื่อแพ็ก เช่น 110 เพชร"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500 sm:col-span-2"
        />
        <input
          required
          type="number"
          min={0}
          step="any"
          placeholder="ราคาขาย (บาท)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          type="number"
          min={0}
          step="any"
          placeholder="ต้นทุน"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          type="number"
          min={0}
          step="any"
          placeholder="จำนวนในเกม (ไม่บังคับ)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500 sm:col-span-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        เพิ่มแพ็ก
      </button>
      {msg && <p className="text-xs text-zinc-400">{msg}</p>}
    </form>
  );
}
