export default class ms {
  intervals: Array<number>
  scroreToProgressChange: Array<number>
  constructor(
    intervals = [1, 2, 3, 8, 17],
    scroreToProgressChange = [-3, -1, 1]
  ) {
    this.intervals = intervals;
    this.scroreToProgressChange = scroreToProgressChange;
  }

  maxProgress = () => {
    return this.intervals.length;
  }
  correctScore = () => {
    return this.scroreToProgressChange.length - 1;
  }

// s 0 = fail, 1 = unsure, 2 = sure
  calculate = (s:number, { progress }, nowDate:Date) => {
    let now = secondToDay(nowDate)
    const correct = s === this.scroreToProgressChange.length - 1;
    const newProgress = progress + this.scroreToProgressChange[s];
    let dueDate = now + 1;
    if (correct && progress < this.maxProgress) {
      dueDate = now + this.intervals[progress];
    }

    const date = dayToDate(dueDate);
    return {
      date,
      progress: newProgress < 0 ? 0 : newProgress
    };
  }
  getInitialRecord = (now) => {
    return {
      progress: 0,
      dueDate: secondToDay(now)
    };
  }

  getProgress = (progress:number, duDate:Date) => {
    return {
      progress: progress,
      duDate: duDate
    }
  }
}

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;

export const dayToDate = (day: number): Date => {
  return new Date(day * DAY_IN_MINISECONDS);
}

export const secondToDay = (date: Date): number => {
  return Math.round(date.getTime() / DAY_IN_MINISECONDS);
}