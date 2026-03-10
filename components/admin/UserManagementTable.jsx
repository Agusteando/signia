"use client";
import UserRow from "./UserRow";
import { stepsExpediente } from "../stepMetaExpediente";

const DOC_KEYS = stepsExpediente.filter(s => !s.isPlantelSelection && !s.adminUploadOnly).map(s => s.key);
export const CHECKLIST_KEYS = [...DOC_KEYS, "proyectivos", "evaId", "pathId"];

export function getUserChecklistProgress(user) {
  let done = 0;
  let checklist = [];

  for (let k of DOC_KEYS) {
    const fulfilled = (user.checklistByType?.[k] && user.checklistByType[k].fulfilled) || false;
    checklist.push({ key: k, type: "doc", fulfilled });
    if (fulfilled) done++;
  }

  const proyectivosUploaded = !!user.hasProyectivos;
  checklist.push({ key: "proyectivos", type: "admin-doc", fulfilled: proyectivosUploaded });
  if (proyectivosUploaded) done++;

  const evaIdDone = !!user.evaId;
  checklist.push({ key: "evaId", type: "field", fulfilled: evaIdDone });
  if (evaIdDone) done++;

  const pathIdDone = !!user.pathId;
  checklist.push({ key: "pathId", type: "field", fulfilled: pathIdDone });
  if (pathIdDone) done++;

  const total = CHECKLIST_KEYS.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { done, total, pct, checklist };
}

export default function UserManagementTable({
  users, planteles, adminsPlanteles, role, selection, allSelected, canAssignPlantel,
  onSelectUser, onSelectAll, onAssignPlantel, onDocs, onFichaTecnica, onSetActive, onDelete,
}) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b-2 border-[#EEF2F7] text-slate-400 text-xs font-extrabold uppercase tracking-widest bg-transparent">
          <th className="py-5 w-14 text-center pl-2">
            <input type="checkbox" className="accent-[#6A3DF0] w-5 h-5 rounded cursor-pointer border-slate-300" checked={allSelected} onChange={e => onSelectAll(e.target.checked)} />
          </th>
          <th className="px-6 py-5">Colaborador / Identidad</th>
          <th className="px-6 py-5">Plantel Asignado</th>
          <th className="px-6 py-5">Estado</th>
          <th className="px-6 py-5 min-w-[200px]">Completitud</th>
          <th className="px-6 py-5 text-right pr-6">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 && (
          <tr><td colSpan={6} className="text-center text-slate-500 py-16 text-base font-semibold bg-[#F6F8FB] rounded-xl mt-4 border border-[#EEF2F7]">No se encontraron colaboradores que coincidan con la búsqueda actual.</td></tr>
        )}
        {users.map(u => (
          <UserRow
            key={u.id}
            user={u}
            planteles={planteles}
            adminsPlanteles={adminsPlanteles}
            role={role}
            selected={!!selection[u.id]}
            canAssignPlantel={canAssignPlantel}
            onSelect={checked => onSelectUser(u.id, checked)}
            onAssignPlantel={onAssignPlantel}
            onDocs={onDocs}
            onFichaTecnica={onFichaTecnica}
            onSetActive={onSetActive}
            onDelete={onDelete}
            getUserChecklistProgress={getUserChecklistProgress}
          />
        ))}
      </tbody>
    </table>
  );
}