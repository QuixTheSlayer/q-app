import moment from "moment"
import { useEffect, useState } from "react"

export type dateType = { day: number, month: number, year: number, minute: number, hour: number }
export function useCountDown (props: {startDate?:Record<string,number>| dateType,endDate?:Record<string,number>|dateType}){

    const {startDate,endDate} = props || {startDate: { day: 0, month: 0, year: 0, minute: 0, hour: 0 },endDate: { day: 0, month: 0, year: 0, minute: 0, hour: 0 }}
      const [date, setDate] = useState<Record<"day" | "month" | "year" | "hour" | "second" | "minute" | 'pct', number>>({
            'day': 0,
            'hour': 0,
            'minute': 0,
            'second': 0,
            'year': 0,
            'month': 0,
            'pct': 100
    
        })
   
        const { day, month, year, minute, hour } = endDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }
    
    
        const start = startDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }
    
    
        const END_DATE = moment(`${year || '0000'}-${month || '00'}-${day || '00'} ${hour || '00'}:${minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")
    
        const START_DATE = moment(`${start.year || '0000'}-${start.month || '00'}-${start.day || '00'} ${start.hour || '00'}:${start.minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")
    
      
    
    
        const [timeLeft, setTimeLeft] = useState("");
    
        useEffect(() => {
            const update = () => {
                // const duration = moment.duration(target.diff(moment()));
    
                const totalDutation = END_DATE.diff(START_DATE)
                const elapsed = moment().diff(START_DATE);
                const left = END_DATE.diff(moment());
    
                // console.log(totalDutation.asMilliseconds(), currentDuration.asMilliseconds())
    
                if (left <= 0) {
                    setTimeLeft("00:00:00");
                    setDate({
                        day: 0,
                        hour: 0,
                        minute: 0,
                        second: 0,
                        year: 0,
                        month: 0,
                        pct: 100
                    })
                }
    
                const duration = moment.duration(left);
    
    
                const precentage = (elapsed / totalDutation) * 100
    
    
    
                setDate({
                    day: Number(duration.asDays().toFixed(0)) || 0,
                    hour: duration.hours() || 0,
                    minute: duration.minutes() || 0,
                    second: duration.seconds() || 0,
                    year: duration.years() || 0,
                    month: duration.months() || 0,
                    pct: Number(precentage.toFixed(1)) || 0
                })
            };
    
            update();
    
            const interval = setInterval(update, 1000);
    
            return () => clearInterval(interval);
        }, [startDate,endDate]);



        return ({
            date
        })
}