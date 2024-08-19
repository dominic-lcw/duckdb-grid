import { CustomStatusPanelProps } from '@ag-grid-community/react';
import db from "../table/duckDB";
import { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import React, { useEffect, useState } from 'react';
// import { AsyncDuckDB } from "@duckdb/duckdb-wasm";

export default (props: CustomStatusPanelProps) => {
  const [count, setCount] = useState<number>(0); // Note not to use bigint

  const fetchData = async () => {
    const connection = await db.connect();
    const arrowResult = await connection.query(`
        SELECT count(*) as c FROM bankdata
    `);

    const result = arrowResult.toArray().map((row) => row.toJSON());
    await connection.close();
    return Number(result[0].c);
  };

  useEffect(() => {
    const rowCount = fetchData()
    rowCount.then((data) => {
      setCount(data);
    })
    // setCount(rowCount);
  }, []);

  return (
    <div className="ag-status-name-value">
      <span className="component">Row Count: &nbsp;</span>
      <span className="ag-status-name-value-value">{count}</span>
    </div>
  );
};