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
        <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider bg-white">
          <th className="py-4 font-medium w-10 text-center">
            <input type="checkbox" className="accent-slate-900 w-4 h-4 rounded cursor-pointer border-slate-300" checked={allSelected} onChange={e => onSelectAll(e.target.checked)} />
          </th>
          <th className="px-4 py-4 font-medium">Usuario</th>
          <th className="px-4 py-4 font-medium">Plantel</th>
          <th className="px-4 py-4 font-medium">Estatus</th>
          <th className="px-4 py-4 font-medium">Progreso</th>
          <th className="px-4 py-4 font-medium text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.length === 0 && (
          <tr><td colSpan={6} className="text-center text-slate-400 py-10 text-sm">No se encontraron usuarios con los filtros aplicados.</td></tr>
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