"use client";

import CalendarIcon from "@/assets/svgs/calendar";
import { useBettingSlips } from "@/context/useBettingSlips";
import { useMatches } from "@/context/useMatchesContext";
import { radar_leagues } from "@/utils/constant";
import { daysArray } from "@/utils/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import Loader from "./loader";
import { useAuthModal } from "@/context/AuthModalContext";

export default function MatchesTable() {
  const router = useRouter();

  const { userData } = useAuthModal();

  const {
    isError,
    isLoading,
    league,
    matches,
    prev,
    next,
    startingDate,
    setStartingDate,
    odds,
  } = useMatches();

  const {
    addSlip,
    removeSlip,
    slips,
    hasPoolStarted,
    setPoolId,
    hasEnteredPool,
  } = useBettingSlips();

  const addToSlip = (match: BettingSlip) => {
    if (hasEnteredPool) {
      toast.error("You cannot make changes to the pool");
      return;
    }

    if (
      slips.some(
        (s) => s.homeTeam === match.homeTeam && s.awayTeam === match.awayTeam
      )
    ) {
      toast.error("Match already in slip");
      return;
    }

    addSlip(match);
  };

  const removeFromSlip = (slip: Partial<BettingSlip>) => {
    if (hasPoolStarted) {
      toast.error("You cannot make changes to the pool");
      return;
    }

    removeSlip(slip as BettingSlip);
  };

  const createSlip = async () => {
    if (!userData.user_id) {
      toast.error("Login to create bet slip");
      return;
    }
    if (!slips.length) {
      toast.error("No matches in slip");
      return;
    }

    setPoolId();

    toast.success("Slip successfully created");

    router.push("/betting-slips");
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex items-center justify-between gap-8">
        <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl">
          Football
        </h2>
        <div className="hidden lg:flex items-center justify-center">
          <select
            value={league}
            onChange={(e) => {
              const newLeague = parseInt(e.target.value);
              if (newLeague < league) prev();
              else next();
            }}
            className="text-sm sm:text-lg md:text-xl font-semibold bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {Object.entries(radar_leagues).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>

        {!hasEnteredPool && (
          <button
            onClick={createSlip}
            className="text-base md:text-lg font-normal bg-[var(--primary)] rounded-lg py-2 md:py-3 px-4 text-white capitalize hover:bg-[var(--primary)]/80"
          >
            Create Slip
          </button>
        )}
      </div>

      <div className="flex lg:hidden items-center justify-center">
        <select
          value={league}
          onChange={(e) => {
            const newLeague = parseInt(e.target.value);
            if (newLeague < league) prev();
            else next();
          }}
          className="text-base sm:text-lg md:text-xl font-semibold bg-transparent border-none focus:outline-none cursor-pointer"
        >
          {Object.entries(radar_leagues).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden lg:flex w-full items-center overflow-x-auto">
        <>
          {daysArray.map((item, i) => (
            <div
              key={i}
              className="flex-1 flex items-center justify-center relative p-4 cursor-pointer hover:bg-[var(--primary-light)]"
              onClick={() =>
                setStartingDate(new Date(item.date).toDateString())
              }
            >
              <p
                className={`text-xl ${
                  startingDate === item.date ? "text-black" : "text-black/50"
                }`}
              >
                {item.label}
              </p>
              {startingDate === item.date && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--primary)] transition-transform duration-300 transform translate-y-0" />
              )}
            </div>
          ))}

          <DatePicker
            excludeDates={daysArray.map((item) => new Date(item.date))}
            minDate={new Date()}
            selected={new Date(startingDate)}
            onChange={(date) => setStartingDate(date?.toDateString() || "")}
            customInput={<CalendarIcon className="cursor-pointer px-2" />}
          />
        </>
      </div>

      <div className="flex lg:hidden items-center justify-between gap-8 px-4 sm:px-[20px] py-4 bg-[var(--primary-light)]">
        <div className="flex items-center gap-6">
          <p className="text-sm">Today</p>

          <DatePicker
            minDate={new Date()}
            selected={new Date(startingDate)}
            onChange={(date) => setStartingDate(date?.toDateString() || "")}
            customInput={<CalendarIcon className="size-6 cursor-pointer" />}
          />
        </div>
        <div className="flex items-center justify-center gap-2 xs:gap-4">
          <p className="text-sm w-8 md:w-12 text-center">1</p>
          <p className="text-sm w-8 md:w-12 text-center">X</p>
          <p className="text-sm w-8 md:w-12 text-center">2</p>
        </div>
      </div>

      {isLoading && (
        <div className="w-full p-8 flex items-center justify-center">
          <Loader />
        </div>
      )}

      {isError && (
        <div className="w-full p-8 flex items-center justify-center">
          <p className="text-xl font-medium text-red-600">
            Error fetching the table data
          </p>
        </div>
      )}

      {!isLoading && !isError && matches.length === 0 && (
        <div className="w-full p-8 flex items-center justify-center">
          <p className="text-xl font-medium">No matches to display</p>
        </div>
      )}

      <div>
        {!isLoading &&
          matches.map((match, i) => (
            <div
              key={i}
              className="w-full px-4 sm:px-6 md:px-8 py-6 border-b border-b-[var(--primary)]/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-8">
                <p className="hidden lg:flex flex-col items-center justify-center gap-1 w-20">
                  {match.sport_event_status.match_status === "ended" ? (
                    "FT"
                  ) : (
                    <>
                      {match.sport_event_status.status === "live" ? (
                        <>
                          <span className="text-[#32FF40]">
                            {match.sport_event_status.clock?.played}
                          </span>
                          <span className="capitalize text-[#32FF40]">
                            {match.sport_event_status.match_status ===
                            "1st_half"
                              ? "1st"
                              : match.sport_event_status.match_status ===
                                "halftime"
                              ? "HT"
                              : "2nd"}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            {new Date(
                              match.sport_event.start_time
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            })}
                          </span>
                          <span>
                            {`${new Date(match.sport_event.start_time)
                              .getHours()
                              .toString()
                              .padStart(2, "0")}:${new Date(
                              match.sport_event.start_time
                            )
                              .getMinutes()
                              .toString()
                              .padStart(2, "0")}`}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </p>

                <div className="flex flex-col gap-2">
                  <div className="text-xs xs:text-sm sm:text-base md:text-xl flex flex-col gap-2 justify-center">
                    <span>{match.sport_event.competitors[0].name}</span>
                    <span>{match.sport_event.competitors[1].name}</span>
                  </div>
                  <p className="lg:hidden text-sm flex items-center gap-1">
                    {match.sport_event_status.match_status === "ended" ? (
                      "FT"
                    ) : (
                      <>
                        {match.sport_event_status.status === "live" ? (
                          <>
                            <span className="text-[#32FF40]">
                              {match.sport_event_status.clock?.played}
                            </span>
                            <span className="capitalize text-[#32FF40]">
                              {match.sport_event_status.match_status ===
                              "1st_half"
                                ? "1st"
                                : match.sport_event_status.match_status ===
                                  "halftime"
                                ? "HT"
                                : "2nd"}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              {new Date(
                                match.sport_event.start_time
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              })}
                            </span>
                            <span>
                              {`${new Date(match.sport_event.start_time)
                                .getHours()
                                .toString()
                                .padStart(2, "0")}:${new Date(
                                match.sport_event.start_time
                              )
                                .getMinutes()
                                .toString()
                                .padStart(2, "0")}`}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-8">
                <div className="text-xs sm:text-base md:text-xl flex flex-col gap-2 items-center justify-center">
                  <span>
                    {match.sport_event_status.status === "not_started"
                      ? "-"
                      : match.sport_event_status.home_score}
                  </span>
                  <span>
                    {match.sport_event_status.status === "not_started"
                      ? "-"
                      : match.sport_event_status.away_score}
                  </span>
                </div>

                <div className="flex items-center gap-2 xs:gap-4 [&>div>p:nth-child(2)]:cursor-pointer">
                  <div className="flex items-center flex-col gap-1 justify-center">
                    <p className="text-sm hidden lg:block">1</p>
                    <p
                      className={`${
                        slips.find(
                          (item) =>
                            item.homeTeam ===
                              match.sport_event.competitors[0].name &&
                            item.awayTeam ===
                              match.sport_event.competitors[1].name &&
                            item.selection === "home"
                        )
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--primary-light)]"
                      } p-2.5 rounded-sm w-8 md:w-12 flex items-center text-xs md:text-base justify-center`}
                      onClick={() => {
                        if (match.sport_event_status.match_status === "ended") {
                          toast.error("Match ended, cannot add match to slip");
                          return;
                        }
                        if (!odds.length) {
                          toast.error("Odds not available for this match");
                          return;
                        }
                        slips.find(
                          (item) =>
                            item.homeTeam ===
                              match.sport_event.competitors[0].name &&
                            item.awayTeam ===
                              match.sport_event.competitors[1].name &&
                            item.selection === "home"
                        )
                          ? removeFromSlip({
                              homeTeam: match.sport_event.competitors[0].name,
                              awayTeam: match.sport_event.competitors[1].name,
                              selection: "home",
                            })
                          : addToSlip({
                              homeTeam: match.sport_event.competitors[0].name,
                              awayTeam: match.sport_event.competitors[1].name,
                              matchDate: new Date(
                                match.sport_event.start_time
                              ).toString(),
                              odds:
                                odds.find(
                                  (event) =>
                                    event.competitors[0].name ===
                                      match.sport_event.competitors[0].name &&
                                    event.competitors[1].name ===
                                      match.sport_event.competitors[1].name
                                )?.markets[0].books[4].outcomes[0].odds || "",
                              outcome: "pending",
                              selection: "home",
                              league_key: radar_leagues[league].season_id,
                            });
                      }}
                    >
                      {match.sport_event_status.match_status !== "ended"
                        ? (() => {
                            const foundEvent = odds.find(
                              (event) =>
                                event.competitors[0].name ===
                                  match.sport_event.competitors[0].name &&
                                event.competitors[1].name ===
                                  match.sport_event.competitors[1].name
                            );
                            const oddsValue =
                              foundEvent?.markets[0].books[4].outcomes[0].odds;
                            return oddsValue
                              ? parseFloat(oddsValue).toFixed(2)
                              : "-";
                          })()
                        : "-"}
                    </p>
                  </div>
                  <div className="flex items-center flex-col gap-1 justify-center">
                    <p className="text-sm hidden lg:block">X</p>
                    <p
                      className={`${
                        slips.find(
                          (item) =>
                            item.homeTeam ===
                              match.sport_event.competitors[0].name &&
                            item.awayTeam ===
                              match.sport_event.competitors[1].name &&
                            item.selection === "draw"
                        )
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--primary-light)]"
                      } p-2.5 rounded-sm w-8 md:w-12 text-xs md:text-base flex items-center justify-center`}
                      onClick={() => {
                        if (match.sport_event_status.match_status === "ended") {
                          toast.error("Match ended, cannot add match to slip");
                          return;
                        }
                        if (!odds.length) {
                          toast.error("Odds not available for this match");
                          return;
                        }
                        slips.find(
                          (item) =>
                            item.homeTeam ===
                              match.sport_event.competitors[0].name &&
                            item.awayTeam ===
                              match.sport_event.competitors[1].name &&
                            item.selection === "draw"
                        )
                          ? removeFromSlip({
                              homeTeam: match.sport_event.competitors[0].name,
                              awayTeam: match.sport_event.competitors[1].name,
                              selection: "draw",
                            })
                          : addToSlip({
                              homeTeam: match.sport_event.competitors[0].name,
                              awayTeam: match.sport_event.competitors[1].name,
                              matchDate: new Date(
                                match.sport_event.start_time
                              ).toString(),
                              odds:
                                odds.find(
                                  (event) =>
                                    event.competitors[0].name ===
                                      match.sport_event.competitors[0].name &&
                                    event.competitors[1].name ===
                                      match.sport_event.competitors[1].name
                                )?.markets[0].books[4].outcomes[1].odds || "",
                              outcome: "pending",
                              selection: "draw",
                              league_key: radar_leagues[league].season_id,
                            });
                      }}
                    >
                      {match.sport_event_status.match_status !== "ended"
                        ? (() => {
                            const foundEvent = odds.find(
                              (event) =>
                                event.competitors[0].name ===
                                  match.sport_event.competitors[0].name &&
                                event.competitors[1].name ===
                                  match.sport_event.competitors[1].name
                            );
                            const oddsValue =
                              foundEvent?.markets?.[0]?.books?.[0]
                                ?.outcomes?.[1]?.odds;
                            return oddsValue
                              ? parseFloat(oddsValue).toFixed(2)
                              : "-";
                          })()
                        : "-"}
                    </p>
                  </div>
                  <div className="flex items-center flex-col gap-1 justify-center">
                    <p className="text-sm hidden lg:block">2</p>
                    <p
                      className={`${
                        slips.find(
                          (item) =>
                            item.homeTeam ===
                              match.sport_event.competitors[0].name &&
                            item.awayTeam ===
                              match.sport_event.competitors[1].name &&
                            item.selection === "away"
                        )
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--primary-light)]"
                      } p-2.5 rounded-sm w-8 md:w-12 text-xs md:text-base flex items-center justify-center`}
                      onClick={() => {
                        if (match.sport_event_status.match_status === "ended") {
                          toast.error("Match ended, cannot add match to slip");
                          return;
                        }
                        if (!odds.length) {
                          toast.error("Odds not available for this match");
                          return;
                        }
                        slips.find(
                          (item) =>
                            item.homeTeam ===
                              match.sport_event.competitors[0].name &&
                            item.awayTeam ===
                              match.sport_event.competitors[1].name &&
                            item.selection === "away"
                        )
                          ? removeFromSlip({
                              homeTeam: match.sport_event.competitors[0].name,
                              awayTeam: match.sport_event.competitors[1].name,
                              selection: "away",
                            })
                          : addToSlip({
                              homeTeam: match.sport_event.competitors[0].name,
                              awayTeam: match.sport_event.competitors[1].name,
                              matchDate: new Date(
                                match.sport_event.start_time
                              ).toString(),
                              odds:
                                odds.find(
                                  (event) =>
                                    event.competitors[0].name ===
                                      match.sport_event.competitors[0].name &&
                                    event.competitors[1].name ===
                                      match.sport_event.competitors[1].name
                                )?.markets[0].books[4].outcomes[2].odds || "",
                              outcome: "pending",
                              selection: "away",
                              league_key: radar_leagues[league].season_id,
                            });
                      }}
                    >
                      {match.sport_event_status.match_status !== "ended"
                        ? (() => {
                            const foundEvent = odds.find(
                              (event) =>
                                event.competitors[0].name ===
                                  match.sport_event.competitors[0].name &&
                                event.competitors[1].name ===
                                  match.sport_event.competitors[1].name
                            );
                            const oddsValue =
                              foundEvent?.markets?.[0]?.books?.[0]
                                ?.outcomes?.[2]?.odds;
                            return oddsValue
                              ? parseFloat(oddsValue).toFixed(2)
                              : "-";
                          })()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export function MiniMatchesTable() {
  const { isError, isLoading, matches, odds, startingDate, setStartingDate } =
    useMatches();

  return (
    <Link href={"/create-slip"}>
      <div className="w-full flex flex-col gap-4">
        <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl">
          Football
        </h2>

        <div className="hidden lg:flex w-full overflow-x-auto">
          {daysArray.map((item, i) => (
            <div
              key={i}
              className="flex-1 flex items-center justify-center relative p-4 cursor-pointer hover:bg-[var(--primary-light)]"
              onClick={() => setStartingDate(item.date)}
            >
              <p
                className={`text-xl ${
                  startingDate === item.date ? "text-black" : "text-black/50"
                }`}
              >
                {item.label}
              </p>
              {startingDate === item.date && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--primary)] transition-transform duration-300 transform translate-y-0" />
              )}
            </div>
          ))}
        </div>

        <div className="flex lg:hidden items-center justify-between gap-8 px-4 sm:px-[20px] py-4 bg-[var(--primary-light)]">
          <p className="text-sm">Today</p>
          <div className="flex items-center justify-center gap-2 xs:gap-4">
            <p className="text-sm w-8 md:w-12 text-center">1</p>
            <p className="text-sm w-8 md:w-12 text-center">X</p>
            <p className="text-sm w-8 md:w-12 text-center">2</p>
          </div>
        </div>

        {isLoading && (
          <div className="w-full p-8 flex items-center justify-center">
            <Loader />
          </div>
        )}

        {isError && (
          <div className="w-full p-8 flex items-center justify-center">
            <p className="text-xl font-medium text-red-600">
              Error fetching the table data
            </p>
          </div>
        )}

        {!isLoading && !isError && matches.length === 0 && (
          <div className="w-full p-8 flex items-center justify-center">
            <p className="text-xl font-medium">No matches to display</p>
          </div>
        )}

        <div>
          {!isLoading &&
            matches.map((match, i) => (
              <div
                key={i}
                className="w-full px-4 sm:px-6 md:px-8 py-6 border-b border-b-[var(--primary)]/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-8">
                  <p className="hidden lg:flex flex-col items-center justify-center gap-1 w-20">
                    {match.sport_event_status.match_status === "ended" ? (
                      "FT"
                    ) : (
                      <>
                        {match.sport_event_status.status === "live" ? (
                          <>
                            <span className="text-[#32FF40]">
                              {match.sport_event_status.clock?.played}
                            </span>
                            <span className="capitalize text-[#32FF40]">
                              {match.sport_event_status.match_status ===
                              "1st_half"
                                ? "1st"
                                : match.sport_event_status.match_status ===
                                  "halftime"
                                ? "HT"
                                : "2nd"}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              {new Date(
                                match.sport_event.start_time
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              })}
                            </span>
                            <span>
                              {`${new Date(match.sport_event.start_time)
                                .getHours()
                                .toString()
                                .padStart(2, "0")}:${new Date(
                                match.sport_event.start_time
                              )
                                .getMinutes()
                                .toString()
                                .padStart(2, "0")}`}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </p>

                  <div className="flex flex-col gap-2">
                    <div className="text-xs xs:text-sm sm:text-base md:text-xl flex flex-col gap-2 justify-center">
                      <span>{match.sport_event.competitors[0].name}</span>
                      <span>{match.sport_event.competitors[1].name}</span>
                    </div>
                    <p className="lg:hidden text-sm flex items-center gap-1">
                      {match.sport_event_status.match_status === "ended" ? (
                        "FT"
                      ) : (
                        <>
                          {match.sport_event_status.status === "live" ? (
                            <>
                              <span className="text-[#32FF40]">
                                {match.sport_event_status.clock?.played}
                              </span>
                              <span className="capitalize text-[#32FF40]">
                                {match.sport_event_status.match_status ===
                                "1st_half"
                                  ? "1st"
                                  : match.sport_event_status.match_status ===
                                    "halftime"
                                  ? "HT"
                                  : "2nd"}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>
                                {new Date(
                                  match.sport_event.start_time
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                })}
                              </span>
                              <span>
                                {`${new Date(match.sport_event.start_time)
                                  .getHours()
                                  .toString()
                                  .padStart(2, "0")}:${new Date(
                                  match.sport_event.start_time
                                )
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, "0")}`}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                  <div className="text-xs sm:text-base md:text-xl flex flex-col gap-2 items-center justify-center">
                    <span>
                      {match.sport_event_status.status === "not_started"
                        ? "-"
                        : match.sport_event_status.home_score}
                    </span>
                    <span>
                      {match.sport_event_status.status === "not_started"
                        ? "-"
                        : match.sport_event_status.away_score}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 xs:gap-4 [&>div>p:nth-child(2)]:cursor-pointer">
                    <div className="flex items-center flex-col gap-1 justify-center">
                      <p className="text-sm hidden lg:block">1</p>
                      <p className="bg-[var(--primary-light)] p-2.5 rounded-sm w-8 md:w-12 text-xs md:text-base flex items-center justify-center">
                        {match.sport_event_status.match_status !== "ended"
                          ? (() => {
                              const foundEvent = odds.find(
                                (event) =>
                                  event.competitors[0].name ===
                                    match.sport_event.competitors[0].name &&
                                  event.competitors[1].name ===
                                    match.sport_event.competitors[1].name
                              );
                              const oddsValue =
                                foundEvent?.markets?.[0]?.books?.[0]
                                  ?.outcomes?.[0]?.odds;
                              return oddsValue
                                ? parseFloat(oddsValue).toFixed(2)
                                : "-";
                            })()
                          : "-"}
                      </p>
                    </div>
                    <div className="flex items-center flex-col gap-1 justify-center">
                      <p className="text-sm hidden lg:block">X</p>
                      <p className="bg-[var(--primary-light)] p-2.5 rounded-sm w-8 md:w-12 text-xs md:text-base flex items-center justify-center">
                        {match.sport_event_status.match_status !== "ended"
                          ? (() => {
                              const foundEvent = odds.find(
                                (event) =>
                                  event.competitors[0].name ===
                                    match.sport_event.competitors[0].name &&
                                  event.competitors[1].name ===
                                    match.sport_event.competitors[1].name
                              );
                              const oddsValue =
                                foundEvent?.markets?.[0]?.books?.[0]
                                  ?.outcomes?.[1]?.odds;
                              return oddsValue
                                ? parseFloat(oddsValue).toFixed(2)
                                : "-";
                            })()
                          : "-"}
                      </p>
                    </div>
                    <div className="flex items-center flex-col gap-1 justify-center">
                      <p className="text-sm hidden lg:block">2</p>
                      <p className="bg-[var(--primary-light)] p-2.5 rounded-sm w-8 md:w-12 text-xs md:text-base flex items-center justify-center">
                        {match.sport_event_status.match_status !== "ended"
                          ? (() => {
                              const foundEvent = odds.find(
                                (event) =>
                                  event.competitors[0].name ===
                                    match.sport_event.competitors[0].name &&
                                  event.competitors[1].name ===
                                    match.sport_event.competitors[1].name
                              );
                              const oddsValue =
                                foundEvent?.markets?.[0]?.books?.[0]
                                  ?.outcomes?.[2]?.odds;
                              return oddsValue
                                ? parseFloat(oddsValue).toFixed(2)
                                : "-";
                            })()
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </Link>
  );
}
