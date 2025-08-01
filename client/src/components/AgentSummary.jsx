const AgentSummary = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
    <div className="bg-white p-4 rounded shadow">
      🕒 Time Since Last Sale: <strong>{stats.timeSinceLastSale}</strong>
    </div>

    <div className="bg-white p-4 rounded shadow">
      📅 Leads Worked On:
      <ul className="list-disc ml-5">
        <li>Daily: {stats.leadsWorked.daily}</li>
        <li>Weekly: {stats.leadsWorked.weekly}</li>
        <li>Monthly: {stats.leadsWorked.monthly}</li>
        <li>Quarterly: {stats.leadsWorked.quarterly}</li>
        <li>Yearly: {stats.leadsWorked.yearly}</li>
      </ul>
    </div>

    <div className="bg-white p-4 rounded shadow">
      📞 Meetings Done:
      <ul className="list-disc ml-5">
        <li>Daily: {stats.meetingsDone.daily}</li>
        <li>Weekly: {stats.meetingsDone.weekly}</li>
        <li>Monthly: {stats.meetingsDone.monthly}</li>
        <li>Quarterly: {stats.meetingsDone.quarterly}</li>
        <li>Yearly: {stats.meetingsDone.yearly}</li>
      </ul>
    </div>

    <div className="bg-white p-4 rounded shadow">
      📅 Upcoming Meetings: <strong>{stats.upcomingMeetings}</strong>
    </div>

    <div className="bg-white p-4 rounded shadow">
      📈 Sales Funnel:
      <ul className="list-disc ml-5">
        {Object.entries(stats.salesFunnel).map(([stage, count]) => (
          <li key={stage}>{stage}: {count}</li>
        ))}
      </ul>
    </div>

    <div className="bg-white p-4 rounded shadow">
      ⚠️ Overdue Followups (Aging):
      <ul className="list-disc ml-5">
        {Object.entries(stats.overdueFollowups).map(([age, count]) => (
          <li key={age}>{age}: {count}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default AgentSummary;
