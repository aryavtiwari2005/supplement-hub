// components/admin/ConsultationTable.tsx
import { useState } from "react";
import { supabase } from "@/utils/supabase";

interface Consultation {
  id: number;
  name: string;
  email: string;
  phone: string;
  fitness_goals: string;
  status: string;
  created_at: string;
  contacted: boolean;
}

interface ConsultationTableProps {
  consultations: Consultation[];
  onUpdate: () => void;
}

export default function ConsultationTable({
  consultations,
  onUpdate,
}: ConsultationTableProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const markAsContacted = async (id: number) => {
    setLoadingId(id);
    try {
      const { error } = await supabase
        .from("fitness_consultations")
        .update({ contacted: true, status: "contacted" })
        .eq("id", id);

      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error("Error updating consultation:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Contact</th>
            <th className="px-4 py-3 text-left">Goals</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {consultations.map((consultation) => (
            <tr key={consultation.id}>
              <td className="px-4 py-3">{consultation.name}</td>
              <td className="px-4 py-3">
                <div className="font-medium">{consultation.email}</div>
                <div className="text-sm text-gray-500">
                  {consultation.phone}
                </div>
              </td>
              <td className="px-4 py-3 max-w-xs">
                <div className="line-clamp-2">{consultation.fitness_goals}</div>
              </td>
              <td className="px-4 py-3">
                {new Date(consultation.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    consultation.contacted
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {consultation.contacted ? "Contacted" : "Pending"}
                </span>
              </td>
              <td className="px-4 py-3">
                {!consultation.contacted && (
                  <button
                    onClick={() => markAsContacted(consultation.id)}
                    disabled={loadingId === consultation.id}
                    className={`px-3 py-1 rounded ${
                      loadingId === consultation.id
                        ? "bg-gray-200 text-gray-500"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    {loadingId === consultation.id
                      ? "Marking..."
                      : "Mark Contacted"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
