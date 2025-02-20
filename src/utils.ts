function getTableString(file: string): string {
  //timetable is the first table in the html document so we search for the first opening table tag
  const startIndex = file.search(`<table`);

  //since timetable is the first table in the html file, we search for the first closing table tag
  const endIndex = file.search(`</table>`);

  //create string containing characters between a given range on indices
  let str = '';
  for (let i = startIndex; i < endIndex + 1; i++) {
    str = str + file.charAt(i);
  }

  return str;
}

function getUnfilteredCourses(str: string): RegExpExecArray[] {
  /*an array of arrays. each array contains a string in index 0, the index that the string appears in within
 the original text at index 1, the original text at index 2 and the groups at index 3*/
  return [...str.matchAll(/[A-z]{3}[1-5][012][0-9][a-z]{0,2}/g)];
}

function getUniqueCourses(unfilteredCourses: RegExpExecArray[]): string[] {
  //array of courses without duplicates
  const courses: string[] = [];

  //new and unique courses always appear at even numbered positions
  for (let i = 0; i < unfilteredCourses.length; i += 2) {
    courses.push(unfilteredCourses[i][0]);
  }

  return courses;
}

function getVenueForEachCourse(
  unfilteredCourses: RegExpExecArray[],
  str: string,
) {
  const tableSchedule = [];
  //find the venues for each course
  for (let i = 0; i < unfilteredCourses.length; i += 2) {
    const charArray = [];
    //get current courses. Each course appears twice on the timetable so that it is easy to view on smaller devices
    const start = unfilteredCourses[i].index; //start position for first appearance
    const end = unfilteredCourses[i + 1].index; //start position for last appearance

    //stores the characters from the begining fo the first apperance untill the end of the last appearance
    let temp = '';

    //get the characters from the begining of the start position until the end position
    for (let j = start; j < end + 5; j++) {
      temp = temp + str.charAt(j);
    }

    //count and store the number of "<td></td>"s and "<td>class-venue</td>"s in the temp string
    for (let j = 10, count = 0; j < temp.length && count < 55; count++) {
      //get first <td>
      let p = temp.indexOf('<td>', j);

      //if the next set of characters are equal to </td> then it is <td></td>
      if (temp.indexOf('</td>', j) === p + 4) {
        charArray.push('<td></td>');

        //set j to the postion immediatly after the <td></td>
        j = p + 9;
      }
      //if the next appearance of </td> is indeed withing the remainder of temp string then it is in the form <td>class-venue</td>
      else if (p > -1) {
        const s = temp.indexOf('</td>', j);
        if (s === -1) {
          console.log('</td> not found, breaking...');
          break;
        }

        let k = '';
        for (let m = p; m < s + 5; m++) {
          k = k + temp.charAt(m);
        }
        if (k !== '') charArray.push(k);
        j = s + 5;
      }
    }

    tableSchedule.push({
      course: unfilteredCourses[i][0],
      order: charArray,
      periods: [],
    });
  }
  return tableSchedule;
}

function getCoursePeriods(
  tableSchedule: { course: string; order: string[]; periods: number[] }[],
) {
  const formatedTimeTable: {
    course: string;
    schedule: { time: string; venue: string }[];
  }[] = [];
  for (let i = 0; i < tableSchedule.length; i++) {
    formatedTimeTable.push({
      course: tableSchedule[i].course,
      schedule: [],
    });
    for (let j = 0; j < tableSchedule[i].order.length; j++) {
      //if empty table block, continue
      if (tableSchedule[i].order[j] === '<td></td>') {
        continue;
      }
      const venue = tableSchedule[i].order[j].slice(
        4,
        tableSchedule[i].order[j].indexOf('</td>'),
      );
      formatedTimeTable[i].schedule.push({ time: `${j}`, venue });
    }
  }

  return formatedTimeTable;
}

export function parseTimetable(fileString: string) {

  //table string
  const str = getTableString(fileString);

  const unfilteredCourses = getUnfilteredCourses(str);

  const uniqueCourses = getUniqueCourses(unfilteredCourses);
  console.log('Your courses: ', uniqueCourses);

  const tableSchedule = getVenueForEachCourse(unfilteredCourses, str);

  const filteredTimeTable = getCoursePeriods(tableSchedule);

  return filteredTimeTable;
}
