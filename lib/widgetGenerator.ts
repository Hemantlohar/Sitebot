export function generateWidgetCode(
  websiteId: string,
  baseUrl = "http://localhost:3000"
) {
  return `<script
src="${baseUrl}/widget.js"
data-bot-id="${websiteId}">
</script>`;
}