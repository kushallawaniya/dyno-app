function mergeSortedArray(A,B) {

    let i=0;
    let j=0;
    let result = [];
    while(i < A.length && j < B.length){
        if (A[i] < B[j]) {
            result.push(A[i]);
            i++;
        }else{
            result.push(B[j]);
            j++;
        }
    }
    while (i < A.length){
        result.push(A[i]);
        i++;
    }
    while (j < B.length){
        result.push(B[j]);
        j++;
    }
    return result();
}
    let A =[1,5,7,8];
    let B = [2,4,6,8];
console.log(mergeSortedArray(A , B));
