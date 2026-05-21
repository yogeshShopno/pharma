import Header from "../../../Header";
import { BsLightbulbFill } from "react-icons/bs";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Button } from "@mui/material";
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DatePicker from "react-datepicker";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useEffect, useState } from "react";
import { addMonths, format, set, subDays, subMonths } from "date-fns";

import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  MenuList,
  Select,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FaSearch } from "react-icons/fa";
import Loader from "../../../../componets/loader/Loader";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import { saveAs } from "file-saver";
import { toast, ToastContainer } from "react-toastify";

const Expiring_Items = () => {

  const history = useHistory();
  const token = localStorage.getItem("token");
  const [startDate, setStartDate] = useState(addMonths(new Date(), 6));
  const [endDate, setEndDate] = useState(addMonths(new Date(), 6));
  const [reportType, setReportType] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [drugGroup, setDrugGroup] = useState("");
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [expiryDateData, setExpiryDateData] = useState([]);
  const totalPages = Math.ceil(
    expiryDateData?.purches_return?.length / rowsPerPage
  );

  const csvIcon = process.env.PUBLIC_URL + "/csv.png";
  const ExpiryItemsColumns = [

    { id: "name", label: "Product Name", minWidth: 200 },
    { id: "qty", label: "Quantity", minWidth: 100 },
    { id: "expiry", label: "Expiry Date", minWidth: 120 },
  ];

  const exportToCSV = () => {
    if (expiryDateData?.length == 0) {
      toast.dismiss();
      toast.error("Apply filter and then after download records.");
    } else {
      const filteredData = expiryDateData?.map(
        ({ id, name, qty, expiry }) => ({
          ID: id,
          ProductName: name,
          Quantity: qty,
          ExpiryDate: expiry,
        })
      );
      const headers = ["ID", "ProductName", "Quantity", "ExpiryDate"];
      const filteredDataRows = filteredData.map((item) =>
        headers.map((header) => item[header])
      );
      const combinedData = [headers, ...filteredDataRows];
      const csv = combinedData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "Expiring_Items_Report.csv");
    }
  };

  const handleClick = (pageNum) => {
    setCurrentPage(pageNum);
    handlefilterData(pageNum);
  };
  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      handlefilterData(newPage);
    }
  };

  const handleNext = () => {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    handlefilterData(newPage);
  };

  const handlefilterData = async (currentPage) => {
    let data = new FormData();
    setIsLoading(true);


    data.append("start_month", startDate ? format(startDate, "MM/yy") : "");
    data.append("end_month", endDate ? format(endDate, "MM/yy") : "");
    data.append("page", currentPage ? currentPage : "");


    const params = {

    };
    try {
      await axios
        .post("/expiry-item-list?", data, {
          params: params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setIsLoading(false);
          setExpiryDateData(response.data.data);
          if (response.data.data.length >= rowsPerPage) {
            setNextButtonDisabled(false);
          } else {
            setNextButtonDisabled(true);
          }
        })
    } catch (error) {
      console.error("API error:", error);
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.clear();
        history.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div>
        <Header />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        {isLoading ? (
          <div className="loader-container ">
            <Loader />
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4 flex report_hdr_main">
              <div
                className="report_hdr_ec"
                style={{
                  display: "flex",
                  gap: "7px",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "7px",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      color: "var(--color2)",
                      display: "flex",
                      fontWeight: 700,
                      fontSize: "20px",
                      cursor: "pointer",
                    }}
                    onClick={() => history.push("/reports")}
                  >
                    {" "}
                    Reports
                  </span>
                  <ArrowForwardIosIcon
                    style={{ fontSize: "18px", color: "var(--color1)" }}
                  />
                </div>
                <span
                  className="report_hdr_txt_ec  gap-2"
                  style={{
                    color: "var(--color1)",
                    display: "flex",
                    fontWeight: 700,
                    fontSize: "20px",
                  }}
                >
                  Expiring Report
                  <BsLightbulbFill className=" w-6 h-6 secondary hover-yellow" />
                </span>
              </div>
              <div className="headerList">
                <Button
                  variant="contained"
                  style={{
                    background: "var(--color1)",
                    color: "white",
                    // paddingLeft: "35px",
                    textTransform: "none",
                    display: "flex",
                  }}
                  className="gap-7 report_btn_purch"
                  onClick={exportToCSV}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src="/csv-file.png"
                      className="report-icon absolute mr-10"
                      alt="csv"
                    />
                  </div>
                  Download
                </Button>
              </div>
            </div>
            <div
              className="row border-b border-dashed"
              style={{ borderColor: "var(--color2)" }}
            ></div>
            <div className="mt-4 "  >
              <div
                className="manageExpenseRow"
              >
                <div
                  className="oreder_list_fld_rp flex flex-col gap-2 md:flex-row pb-2 csrtureddididid"
                  style={{ width: "100%", alignItems: "end" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-4 w-full gap-3 ttl_dldld">
                    <div className="detail_report detailrep_100 flex flex-col">
                      <span className="primary">Start Date</span>
                      <div style={{ width: "100%" }}>
                        <DatePicker
                          className="custom-datepicker"
                          selected={startDate}
                          onChange={(newDate) => setStartDate(newDate)}
                          dateFormat="MM/yyyy"
                          showMonthYearPicker

                        />
                      </div>
                    </div>
                    <div className="detail_report detailrep_100 flex flex-col">
                      <span className="primary">End Date</span>
                      <div style={{ width: "100%" }}>
                        <DatePicker
                          className="custom-datepicker "
                          selected={endDate}
                          onChange={(newDate) => setEndDate(newDate)}
                          dateFormat="MM/yyyy"
                          showMonthYearPicker
                        />
                      </div>
                    </div>

                    <div className="detail_report detailrep_100 flex flex-col justify-end">
                      <Button
                        className="go_btn_divv"
                        style={{
                          background: "var(--color1)",
                          width: "fit-content",
                          height: "40px",
                        }}
                        variant="contained"
                        onClick={() => handlefilterData(currentPage)}
                      >
                        Go
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
              {expiryDateData?.length > 0 ? (
                <div className="firstrow">
                  <div className="overflow-x-auto mt-4">
                    <table
                      className="w-full border-collapse custom-table"
                      style={{
                        whiteSpace: "nowrap",
                        borderCollapse: "separate",
                        borderSpacing: "0 6px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th>
                            SR NO.
                          </th>
                          {ExpiryItemsColumns.map((column) => (
                            <th
                              key={column.id}
                              style={{ minWidth: column.minWidth }}
                            >
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody style={{ background: "#3f621217" }}>
                        {expiryDateData?.map(
                          (item, index) => (

                            <tr key={index}>
                              <td
                                style={{
                                  borderRadius: "10px 0 0 10px",
                                }}
                              >
                                {index + 1}
                              </td>
                              {ExpiryItemsColumns.map(
                                (column, colIndex) => (
                                  <td
                                    key={column.id}
                                    style={
                                      colIndex === ExpiryItemsColumns.length - 1
                                        ? {
                                          borderRadius: "0 10px 10px 0",
                                        }
                                        : {}
                                    }
                                  >
                                    {item[column.id]}
                                  </td>
                                )
                              )}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="mt-4 space-x-1"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <button
                      onClick={handlePrevious}
                      className={`mx-1 px-3 py-1 rounded ${currentPage === 1
                        ? "bg-gray-200 text-gray-700"
                        : "secondary-bg text-white"
                        }`}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleClick(i + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1
                          ? "secondary-bg text-white"
                          : "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={handleNext}
                      className={`mx-1 px-3 py-1 rounded ${nextButtonDisabled
                        ? "bg-gray-200 text-gray-700"
                        : "secondary-bg text-white"
                        }`}
                      disabled={nextButtonDisabled}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="SearchIcon">
                    <div>
                      <FaSearch className="IconSize" />
                    </div>
                    <p className="text-gray-500 font-semibold">
                      Apply filter to get records.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default Expiring_Items;