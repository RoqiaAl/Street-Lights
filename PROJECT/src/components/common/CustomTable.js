const CustomTable = ({
  headers,
  data,
  isDashboard = false,
  agent,
  propertyIds,
  threeDots = false,
}) => {
  const columnWidth = 100 / headers.length;

  return (
    <div className={`overflow-auto w-full `}>
      <table className="min-w-full table-fixed">
        <thead>
          <tr>
            {headers?.map((header, index) => (
              <th
                key={index}
                className={`py-3 px-6 ${
                  isDashboard ? "font-semibold text-lg" : "font-medium text-xs"
                } tracking-wider uppercase text-gray-700 ${
                  isDashboard ? "" : "border-b border-gray-200"
                }`}
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  // width: "33%",
                  textAlign: index === 0 ? "left" : "center",
                }}
              >
                {data?.length > 0 ? header : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-10">
                <h2 className="text-lg font-semibold text-gray-600">No Data</h2>
              </td>
            </tr>
          ) : (
            data?.map((row, rowIndex) => {
              const cells = propertyIds ? row.slice(1) : row;
              console.log("row", row);
              const property = row[0];
              return (
                <tr
                  key={rowIndex}
                  className={`relative ${
                    isDashboard ? "" : "border-b border-gray-200"
                  }`}
                >
                  {cells.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`pb-4 px-6 text-sm text-gray-500 text-center h-[64px] whitespace-nowrap ${
                        cellIndex === 2
                          ? " w-full flex justify-center items-center"
                          : ""
                      }`}
                      style={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textAlign: cellIndex === 0 ? "left" : "center",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;
