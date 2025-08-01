const ReportDownload = ({ onDownload }) => (
  <div className="mt-6 text-right">
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      onClick={onDownload}
    >
      ⬇️ Download PDF Report
    </button>
  </div>
);

export default ReportDownload;
