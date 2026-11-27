// Preserve links shared before the standalone workspace entry point was introduced.
function openLegacyWorkspaceLink() {
  const workspaceHash = /^#(?:explorer(?:\/\d+)?|library|desk|studio|journey|bloom|platform|top)$/;
  if (workspaceHash.test(location.hash)) location.replace('workspace.html' + location.hash);
}
openLegacyWorkspaceLink();
window.addEventListener('hashchange', openLegacyWorkspaceLink);
