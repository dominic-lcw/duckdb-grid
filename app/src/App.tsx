import { useEffect, useState, useRef, useMemo } from "react";
import * as React from "react";
import {
  Tabs,
  Tab,
  Box,
  IconButton,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import "react-tabs/style/react-tabs.css";
import "./App.css";
import StdAgGrid from "./components/grid/stdGrid";
import AddIcon from "@mui/icons-material/Add";
import { ColumnDataType } from "./components/grid/gridTypes";
import InitUserTable, {
  InitParquetTable,
  InitS3ParquetTable,
} from "./components/table/initTable";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  height: string | number;
  width: string | number;
}

interface GridTable {
  table: string;
  columns: ColumnDataType;
}

interface TableCatelog {
  [key: string]: GridTable;
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212",
      paper: "#1d1d1d",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
});

/* 
  ------------START OF USER EDITABLE AREA------------
  Go through the README below to setup the table.
*/
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, height, width, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={`tab-panel${value !== index ? "-hidden" : ""}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, height: height || "auto", width: width || "auto" }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [ready, setReady] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const loadingFailedFlag = useRef<JSX.Element | null>(null);
  const [tabData, setTabData] = useState<any[]>([]);
  const [value, setValue] = React.useState(1); // Initial state of the tabs

  /* 
    README: Init Steps
  */
  const userColumns: ColumnDataType = {
    domain: "VARCHAR",
    date: "DATE",
    today_location: "VARCHAR",
    today_daily_value: "DOUBLE",
    today_daily_transaction_count: "DOUBLE",
    row_number: "INTEGER",
  };
  const failedFlag = InitParquetTable("./bankdataset.parquet", userColumns);
  if (failedFlag !== null) {
    console.log("check failedFlag", failedFlag);
    loadingFailedFlag.current = failedFlag;
  }

  const [tableCatalog, setTableCatalog] = useState<TableCatelog>({});
  useEffect(() => {
    setTableCatalog({
      user: {
        table: "bankdataset",
        columns: userColumns,
      },
    });
  }, [loadingFailedFlag]);

  /* 
    README: Choose the table you want to initialize
  */
  // const table = InitUserTable();
  // const s3ParquetTable = InitS3ParquetTable();

  /* 
    ------------END OF USER EDITABLE AREA------------
  */
  useEffect(() => {
    setReady(true);
  }, [loadingFailedFlag]);

  // Init with two tabs
  useEffect(() => {
    const tabData = [
      {
        label: "Tab 1",
        content: (
          <StdAgGrid
            columnDataType={userColumns}
            setExecutionTime={setExecutionTime}
          />
        ),
      },
    ];
    setTabData(tabData);
  }, [loadingFailedFlag]);

  // render Tabs Functions
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  // Add Tabs
  const handleAddTab = () => {
    const newIndex = tabData.length;
    const newTab = {
      label: `Tab ${newIndex + 1}`, // Tab starts at 1, 0 is the plus button
      content: (
        <StdAgGrid
          columnDataType={userColumns}
          setExecutionTime={setExecutionTime}
        />
      ),
    };
    setTabData([...tabData, newTab]);
    setValue(newIndex + 1);
  };

  function renderExecutionTime() {
    if (executionTime === 0) {
      return (
        <div className="loading">
          <span className="dot">🟡</span>
          <span className="dot">🟡</span>
          <span className="dot">🟡</span>
        </div>
      );
    } else {
      return <div>Exec: {executionTime.toFixed(2)} ms</div>;
    }
  }

  function renderTabs() {
    return (
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
      >
        <IconButton onClick={handleAddTab} aria-label="add tab">
          <AddIcon />
        </IconButton>
        {tabData.map((tab, index) => (
          <Tab label={tab.label} {...a11yProps(index)} />
        ))}
      </Tabs>
    );
  }

  function renderTabPanels() {
    return tabData.map((tab, index) => (
      <CustomTabPanel
        value={value}
        index={index + 1} // Value starts at 1. 0 is the add button
        height={"95%"}
        width={"95%"}
      >
        {tab.content}
      </CustomTabPanel>
    ));
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="app-container">
        <div
          className="top-right"
          style={{ position: "absolute", top: "10px", right: "10px" }}
        >
          {renderExecutionTime()}
        </div>
        <h1 className="app-title">Standard Grid</h1>
        <div>
          {ready ? (
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                {renderTabs()}
              </Box>
              {renderTabPanels()}
            </Box>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
