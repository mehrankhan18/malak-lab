import api from './api';

export async function downloadReportPdf(reportId) {
  const response = await api.get(`/reports/${encodeURIComponent(reportId)}/pdf`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `MALAK_Lab_Report_${reportId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
