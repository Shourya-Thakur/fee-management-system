let showAllProcessed = false;

// 🔐 SESSION CHECK (PUT AT TOP - OUTSIDE)
const userEmail = localStorage.getItem("userEmail");

if(!userEmail && !window.location.pathname.includes("login.html")){
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function(){

    console.log("MAIN JS LOADED");
    console.log("JS Loaded");

// LOGIN FORM
const form = document.getElementById("loginForm");

if(form){
    form.addEventListener("submit", function(e){
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const selectedRole = document.getElementById("role").value;

        fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(res => res.json())
        .then(data => {

    console.log("LOGIN RESPONSE:", data);

    if(data.message !== "Login successful"){
        alert("Invalid email or password!");
        return;
    }

    if(data.role !== selectedRole){
        alert("Selected role does not match your account!");
        return;
    }

    // ✅ DEBUG
    console.log("Saving email:", email);

    localStorage.setItem("userEmail", email);

    console.log("Stored email:", localStorage.getItem("userEmail"));

    if(data.role === "student"){
        window.location.href = "student.html";
    }
    else if(data.role === "accountant"){
        window.location.href = "accountant.html";
    }
    else if(data.role === "admin"){
        window.location.href = "admin.html";
    }

})
        .catch(err => {
            console.log(err);
            alert("Login failed");
        });
    });
}

// PAYMENT FORM
const paymentForm = document.getElementById("paymentForm");

if(paymentForm){
    paymentForm.addEventListener("submit", function(e){
        e.preventDefault();

        console.log("Payment form submitted");

        const amount = Number(document.getElementById("amount").value);
        const mode = document.getElementById("mode").value;
        const reference = document.getElementById("reference").value.trim();

        const pendingAmount = Number(window.maxAllowedAmount || 0);

        if(!amount || amount <= 0){
            alert("Please enter a valid amount!");
            return;
        }

        if(!pendingAmount){
            alert("Balance not loaded yet. Please wait.");
            return;
        }

        if(!reference){
            alert("Please enter reference number!");
            return;
        }

        if(amount > pendingAmount){
            alert("❌ Amount exceeds pending balance!");
            return;
        }
            const email = localStorage.getItem("userEmail");

        fetch("http://127.0.0.1:5000/submit-payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                amount: amount,
                mode: mode,
                reference: reference
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            alert("Payment request submitted!");
        })
        .catch(err => {
            console.log(err);
            alert("Error submitting payment");
        });
    });
}


const page = window.location.pathname;


if(page.includes("student.html")){
    loadStudentDashboard();
    loadMyRequests();
    loadTransactionHistory();
    loadStudentBalance();
}

if(page.includes("accountant.html")){
    loadPendingRequests();
    loadDefaulters();
}

if(page.includes("admin.html")){
    setTimeout(() => {
        showSection("dashboard");
    }, 100);
}

// Ending 
});

function loadStudentDashboard(){

    const email = localStorage.getItem("userEmail");

    fetch("http://127.0.0.1:5000/payment-requests")
    .then(res => res.json())
    .then(data => {

        console.log("Stored Email:", email);
        console.log("All Data:", data);

        // ✅ FIX: handle case + spaces
        const studentData = data.filter(r => 
            r.student_email &&
            r.student_email.trim().toLowerCase() === email.trim().toLowerCase()
        );

        console.log("Filtered Student Data:", studentData);

        let totalPaid = 0;
        let totalPending = 0;
        let totalRequests = studentData.filter(r => r.status === "pending").length;

        studentData.forEach(r => {
            if(r.status === "approved"){
                totalPaid += Number(r.amount);
            } 
            else if(r.status === "pending"){
                totalPending += Number(r.amount);
            }
            // ❌ rejected ignored automatically
        });

        fetch(`http://127.0.0.1:5000/student-fee/${email}`)
.then(res => res.json())
.then(feeData => {

    const totalFees = feeData.total_fee;

    const totalFeesEl = document.getElementById("totalFees");
    const paidEl = document.getElementById("paidAmount");
    const pendingEl = document.getElementById("pendingAmount");
    const requestsEl = document.getElementById("totalRequests");

    if(totalFeesEl)
        totalFeesEl.innerText =
            "₹" + Number(totalFees).toLocaleString('en-IN');

    if(paidEl)
        paidEl.innerText =
            "₹" + Number(totalPaid).toLocaleString('en-IN');

    if(pendingEl)
        pendingEl.innerText =
            "₹" + Number(totalFees - totalPaid).toLocaleString('en-IN');
    
    if(requestsEl) requestsEl.innerText = totalRequests;

});


        // ===============================
        // ✅ RECENT REQUESTS TABLE
        // ===============================
        const recentTable = document.getElementById("recentRequestsTable");

        if(recentTable){
    recentTable.innerHTML = "";

    const recentData = [...studentData]   // ✅ avoid modifying original
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // ✅ STEP 5: EMPTY STATE
    if(recentData.length === 0){
        recentTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-gray-500">
                    No payment requests found
                </td>
            </tr>
        `;
    } 
    else {

        // 👉 your existing loop (no change inside)
        recentData.forEach(r => {

            let statusColor = "";
            if(r.status === "approved") statusColor = "text-green-600";
            else if(r.status === "rejected") statusColor = "text-red-600";
            else statusColor = "text-yellow-600";

            const row = `
            <tr>
                <td>${new Date(r.date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
}).toUpperCase()}</td>
                <td>₹${Number(r.amount).toLocaleString('en-IN')}</td>
                <td>${r.payment_mode}</td>
                <td>${r.reference_no}</td>
                <td>
                    <span class="${statusColor} font-semibold px-2 py-1 rounded">
                        ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                </td>
            </tr>
            `;

            recentTable.innerHTML += row;
        });

    }
}


        // ===============================
        // ✅ APPROVED TRANSACTIONS TABLE
        // ===============================
        const approvedTable = document.getElementById("approvedTable");

        if(approvedTable){
            approvedTable.innerHTML = "";

            const approvedData = studentData
    .filter(r => r.status === "approved")
    .slice(0, 10);   // ✅ LIMIT TO 10

            approvedData.forEach(r => {

                const row = `
                <tr>
                    <td>${new Date(r.date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
}).toUpperCase()}</td>
                    <td>₹${Number(r.amount).toLocaleString('en-IN')}</td>
                    <td>${r.payment_mode}</td>
                </tr>
                `;

                approvedTable.innerHTML += row;
            });
        }

    })
    .catch(err => {
        console.log("Dashboard Error:", err);
    });

}


function approve(id){
    fetch("http://127.0.0.1:5000/approve-payment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        alert("Payment Approved");
        loadPendingRequests();
    });
}

function reject(id){
    fetch("http://127.0.0.1:5000/reject-payment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        alert("Payment Rejected");
        loadPendingRequests();
    });
}



function goToPaymentPage(){
showSection("requests");
loadPendingRequests();


}



function loadPendingRequests(){


const dashboardTable = document.getElementById("dashboardPendingTable");
const paymentTable = document.getElementById("pendingRequestsTable");

// 🔥 GET CORRECT DASHBOARD DATA
fetch("http://127.0.0.1:5000/admin-dashboard")
.then(res => res.json())
.then(data => {

    const totalStudentsEl = document.getElementById("totalStudents");
    const feesExpectedEl = document.getElementById("feesExpected");
    const feesCollectedEl = document.getElementById("feesCollected");
    const feesPendingEl = document.getElementById("feesPending");

    const pendingSubText = document.getElementById("pendingStudentsText");

    if(pendingSubText){
        pendingSubText.innerText = `(${data.pending_students} Students)`;
    }
    

    if(totalStudentsEl){
        totalStudentsEl.innerText = data.students;
    }

    if(feesExpectedEl){
        const total = Number(data.collected) + Number(data.pending);
        feesExpectedEl.innerText =
            "₹" + Number(total).toLocaleString('en-IN');
    }

    if(feesCollectedEl){
        feesCollectedEl.innerText =
            "₹" + Number(data.collected).toLocaleString('en-IN');
    }

    if(feesPendingEl){
        feesPendingEl.innerText =
         "₹" + Number(data.pending).toLocaleString('en-IN');
    }

});

fetch("http://127.0.0.1:5000/payment-requests")
.then(res => res.json())
.then(data => {

    // ===============================
    // ✅ DASHBOARD CARDS DATA
    // ===============================

// Unique Students
const students = new Set(data.map(r => r.student_email));
const totalStudents = students.size;



    const pendingData = data.filter(r => r.status === "pending");

    // Counts
    const dashboardCount = document.getElementById("pendingCount");
    if(dashboardCount){
        dashboardCount.innerText = pendingData.length;
    }
// BONUS → show unique student count


    const reviewCount = document.getElementById("pendingReviewCount");
    if(reviewCount){
        reviewCount.innerText = pendingData.length;
    }

    // DASHBOARD TABLE (only 3)
    if(dashboardTable){
        dashboardTable.innerHTML = "";

        pendingData.slice(0,3).forEach(req => {
            const row = `
            <tr>
                <td>${req.student_email}</td>
                <td class="font-medium">
                     ₹${Number(req.amount).toLocaleString('en-IN')}
                </td>
                <td>${req.payment_mode}</td>
                <td>${req.reference_no}</td>
                <td>${new Date(req.date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
}).toUpperCase()}</td>
                <td>
                    <button type="button" onclick="goToPaymentPage()" class="bg-blue-600 text-white px-2 py-1 rounded">
                        View
                    </button>
                </td>
            </tr>
            `;
            dashboardTable.innerHTML += row;
        });
    }

    // PAYMENT REQUEST TABLE (all)

const pendingCountStats =
    data.filter(r => r.status === "pending").length;

const approvedCountStats =
    data.filter(r => r.status === "approved").length;

const rejectedCountStats =
    data.filter(r => r.status === "rejected").length;
    
const pendingStats =
    document.getElementById("pendingStats");

const approvedStats =
    document.getElementById("approvedStats");

const rejectedStats =
    document.getElementById("rejectedStats");

if(pendingStats){
    pendingStats.innerText = pendingCountStats;
}

if(approvedStats){
    approvedStats.innerText = approvedCountStats;
}

if(rejectedStats){
    rejectedStats.innerText = rejectedCountStats;
}    


    if(paymentTable){
        paymentTable.innerHTML = "";

        pendingData.forEach(req => {
            const row = `
            <tr>
                <td>${req.student_email}</td>
                <td class="font-medium">
                    ₹${Number(req.amount).toLocaleString('en-IN')}
                </td>
                <td>${req.payment_mode}</td>
                <td>${req.reference_no}</td>
                <td>${new Date(req.date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
}).toUpperCase()}</td>
                <td>
                    <button type="button" onclick="approve(${req.id})" class="bg-green-600 text-white px-2 py-1 rounded">Approve</button>
                    <button type="button" onclick="reject(${req.id})" class="bg-red-600 text-white px-2 py-1 rounded">Reject</button>
                </td>
            </tr>
            `;
            paymentTable.innerHTML += row;
        });
    }

    const processedTable = document.getElementById("processedRequestsTable");

if(processedTable){
processedTable.innerHTML = "";


const allProcessedData = data
.filter(r => r.status !== "pending")
.sort((a, b) => new Date(b.date) - new Date(a.date));

const processedData = showAllProcessed
    ? allProcessedData
    : allProcessedData.slice(0, 20);

const processedCount =
    document.getElementById("processedCount");

const toggleBtn =
    document.getElementById("toggleProcessedBtn");

if(toggleBtn){
    toggleBtn.innerText =
        showAllProcessed
        ? "Hide"
        : "View All";
}    

if(processedCount){
    processedCount.innerText = allProcessedData.length;
}

const processedInfo =
    document.getElementById("processedInfo");

if(processedInfo){

    if(showAllProcessed){
        processedInfo.innerText =
            `Showing all ${allProcessedData.length} processed requests`;
    }
    else{
        processedInfo.innerText =
            `Showing latest ${processedData.length} processed requests`;
    }

}

processedData.forEach(req => {

    let statusBadge = "";

        if(req.status === "approved"){
            statusBadge = `
                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Approved
                </span>
            `;
        }
        else{
            statusBadge = `
                <span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    Rejected
                </span>
            `;
        }

    const row = `
    <tr>
        <td>${req.student_email}</td>
        <td class="font-medium">
            ₹${Number(req.amount).toLocaleString('en-IN')}
        </td>
        <td>${req.payment_mode}</td>
        <td>${new Date(req.date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
}).toUpperCase()}</td>
        <td>
    ${statusBadge}
        </td>
    </tr>
    `;

    processedTable.innerHTML += row;
});


}

});


}


// ===============================
// ✅ MY REQUESTS (STUDENT)
// ===============================

let allRequests = [];

function loadMyRequests(){

    const email = localStorage.getItem("userEmail");
    const table = document.getElementById("myRequestsTable");

    if(!table) return;

    fetch("http://127.0.0.1:5000/payment-requests")
    .then(res => res.json())
    .then(data => {

        allRequests = data.filter(
            r => r.student_email &&
            r.student_email.trim().toLowerCase() === email.trim().toLowerCase()
        );

        renderRequests(allRequests);
    });
}


// ===============================
// ✅ RENDER FUNCTION
// ===============================
function renderRequests(data){

    const table = document.getElementById("myRequestsTable");
    table.innerHTML = "";

    if(data.length === 0){
        table.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-gray-500">
                No requests found
            </td>
        </tr>`;
        return;
    }

    data.forEach(r => {

        let statusColor = "";
        if(r.status === "approved") statusColor = "text-green-600";
        else if(r.status === "rejected") statusColor = "text-red-600";
        else statusColor = "text-yellow-600";

        const row = `
        <tr>
            <td>${new Date(r.date).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).toUpperCase()}</td>

            <td>₹${Number(r.amount).toLocaleString('en-IN')}</td>
            <td>${r.payment_mode}</td>
            <td>${r.reference_no}</td>

            <td>
                <span class="${statusColor} font-semibold px-2 py-1 rounded">
                    ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
            </td>
        </tr>
        `;

        table.innerHTML += row;
    });
}


// ===============================
// ✅ FILTER FUNCTION
// ===============================
function filterRequests(type){

    if(type === "all"){
        renderRequests(allRequests);
    }
    else{
        const filtered = allRequests.filter(r => r.status === type);
        renderRequests(filtered);
    }
}

// ===============================
// ✅ Search by Reference Function
// ===============================
function searchRequests(){

    const input = document.getElementById("searchInput").value.toLowerCase();

    const filtered = allRequests.filter(r => 
        r.reference_no && r.reference_no.toLowerCase().includes(input)
    );

    renderRequests(filtered);
}

// ===============================
// ✅ TRANSACTION HISTORY
// ===============================
function loadTransactionHistory(){

    const email = localStorage.getItem("userEmail");
    const table = document.getElementById("transactionHistoryTable");

    if(!table) return;

    fetch("http://127.0.0.1:5000/payment-requests")
    .then(res => res.json())
    .then(data => {

        const transactions = data
            .filter(r => 
                r.student_email &&
                r.student_email.trim().toLowerCase() === email.trim().toLowerCase() &&
                r.status === "approved"
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        table.innerHTML = "";

        // ✅ EMPTY STATE
        if(transactions.length === 0){
            table.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-gray-500">
                    No transactions found
                </td>
            </tr>`;
            return;
        }

        transactions.forEach(r => {

            const row = `
<tr>
    <td>${new Date(r.date).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).toUpperCase()}</td>

    <td>₹${Number(r.amount).toLocaleString('en-IN')}</td>
    <td>${r.payment_mode}</td>

    <td>
      <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
        Success
      </span>
    </td>

    <td>
      <button onclick="downloadReceipt('${r.id}', '${r.amount}', '${r.payment_mode}', '${r.date}')"
        class="bg-blue-600 text-white px-2 py-1 rounded text-sm">
        Download
      </button>
    </td>
</tr>
`;

            table.innerHTML += row;
        });

    });
}



function downloadReceipt(id, amount, mode, date){

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Payment Receipt", 20, 20);
    doc.text(`Transaction ID: ${id}`, 20, 40);
    doc.text(`Date: ${new Date(date).toLocaleString()}`, 20, 50);
    doc.text(`Amount: Rs. ${amount}`, 20, 60);
    doc.text(`Mode: ${mode}`, 20, 70);
    doc.text(`Status: Success`, 20, 80);

    doc.save(`receipt_${id}.pdf`);
}


// ===============================
// ✅ LOGOUT FUNCTION
// ===============================
function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}


// ===============================
// ✅ Defaulter FUNCTION
// ===============================
function loadDefaulters(){

    fetch("http://127.0.0.1:5000/defaulters")
    .then(res => res.json())
    .then(data => {

        const table = document.getElementById("defaultersTable");
        const countText = document.getElementById("defaulterCountText");

        if(!table) return;

        table.innerHTML = "";

        // COUNT
        if(countText){
            countText.innerText =
                data.length === 1
                ? "1 Student with pending fees"
                : data.length + " Students with pending fees";
        }

        // EMPTY
        if(data.length === 0){
            table.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-gray-500">
                        No defaulters 🎉
                    </td>
                </tr>
            `;
            return;
        }

        // DATA
        data.forEach(s => {
            const row = `
            <tr class="border-b">
                <td>${s.email}</td>
                <td>₹${Number(s.paid).toLocaleString('en-IN')}</td>

                <td class="text-red-600 font-semibold">
                    ₹${Number(s.pending).toLocaleString('en-IN')}
                </td>
            </tr>
            `;
            table.innerHTML += row;
        });

    });
}

// ===============================
// ✅ Student FUNCTION in Accountant
// ===============================

function loadStudents(){

    fetch("http://127.0.0.1:5000/payment-requests")
    .then(res => res.json())
    .then(data => {

        const table = document.getElementById("studentsTable");
        if(!table) return;

        table.innerHTML = "";

        // ===============================
        // GROUP BY STUDENT
        // ===============================
        const studentMap = {};

        data.forEach(r => {
            const email = r.student_email;

            if(!studentMap[email]){
                studentMap[email] = {
                    paid: 0,
                    pending: 0
                };
            }

            if(r.status === "approved"){
                studentMap[email].paid += Number(r.amount);
            }
            else if(r.status === "pending"){
                studentMap[email].pending += Number(r.amount);
            }
        });

        // ===============================
        // RENDER TABLE
        // ===============================
        Object.keys(studentMap).forEach(email => {

            const student = studentMap[email];

            let status = "";
            let statusColor = "";

            if(student.pending > 0){
                status = "Pending";
                statusColor = "text-yellow-600";
            } else if(student.paid > 0){
                status = "Paid";
                statusColor = "text-green-600";
            } else {
                status = "Not Paid";
                statusColor = "text-red-600";
            }

            const row = `
            <tr>
                <td>${email}</td>
                <td>
                     ₹${Number(student.paid).toLocaleString('en-IN')}
                </td>

                <td class="text-red-600">
                    ₹${Number(student.pending).toLocaleString('en-IN')}
                </td>
                <td>
                    <span class="${statusColor} font-semibold px-2 py-1 rounded">
                        ${status}
                    </span>
                </td>
            </tr>
            `;

            table.innerHTML += row;
        });

    });
}


function addCourse(){

    const name = document.getElementById("courseName").value;
    const fee = document.getElementById("courseFee").value;
    const sem = document.getElementById("courseSem").value;

    fetch("http://127.0.0.1:5000/add-course", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            course_name: name,
            total_fee: fee,
            semesters: sem
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Course Added ✅");
        document.getElementById("courseName").value = "";
        document.getElementById("courseFee").value = "";
        document.getElementById("courseSem").value = "";
        loadCourses(); // refresh table
    });
}


function loadCourses(){

    fetch("http://127.0.0.1:5000/courses")
    .then(res => res.json())
    .then(data => {

        const table = document.getElementById("courseTable");

        if(!table) return;

        table.innerHTML = "";

        data.forEach(c => {

            const row = `
        <tr>
            <td>${c.course_name}</td>
            <td>₹${Number(c.total_fee).toLocaleString('en-IN')}</td>
            <td>${c.semesters}</td>

            <td>
                <button
                    onclick="deleteCourse(${c.id}, '${c.course_name}')"
                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                    Delete
                </button>
            </td>
        </tr>
        `;

            table.innerHTML += row;
        });
    });
}

// ===============================
// ✅ COURSES GLOBAL DATA (ADD HERE)
// ===============================
let allCourses = [];

function fetchCourses(){
    return fetch("http://127.0.0.1:5000/courses")
    .then(res => res.json())
    .then(data => {
        console.log("Courses Loaded:", data);
        allCourses = data;
    });
}

function loadUsers(){

    fetch("http://127.0.0.1:5000/users")
    .then(res => res.json())
    .then(data => {

        const studentsTable = document.getElementById("studentsTableAdmin");
        const accountantsTable = document.getElementById("accountantsTableAdmin");
        const adminsTable = document.getElementById("adminsTableAdmin");

        if(studentsTable) studentsTable.innerHTML = "";
        if(accountantsTable) accountantsTable.innerHTML = "";
        if(adminsTable) adminsTable.innerHTML = "";

        data.forEach(user => {

            let courseOptions = allCourses.map(c => {
                let selected = user.course_id == c.id ? "selected" : "";
                return `<option value="${c.id}" ${selected}>${c.course_name}</option>`;
            }).join("");

            // 👨‍🎓 STUDENTS
            if(user.role === "student"){

                const row = `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>

                    <td>
                        <select onchange="assignCourse('${user.email}', this.value)"
                            class="border p-1 rounded">
                            <option value="">Select</option>
                            ${courseOptions}
                        </select>
                    </td>

                    <td>
                        <button onclick="deleteUser('${user.email}')"
                            class="bg-red-600 text-white px-2 py-1 rounded">
                            Delete
                        </button>
                    </td>
                </tr>
                `;

                studentsTable.innerHTML += row;
            }

            // 💼 ACCOUNTANTS
            else if(user.role === "accountant"){

                const row = `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>

                    <td>
                        <button onclick="deleteUser('${user.email}')"
                            class="bg-red-600 text-white px-2 py-1 rounded">
                            Delete
                        </button>
                    </td>
                </tr>
                `;

                accountantsTable.innerHTML += row;
            }

            // 👑 ADMINS
            else if(user.role === "admin"){

                const row = `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>

                    <td>
                        <button onclick="deleteUser('${user.email}')"
                            class="bg-red-600 text-white px-2 py-1 rounded">
                            Delete
                        </button>
                    </td>
                </tr>
                `;

                adminsTable.innerHTML += row;
            }

        });

    });
}


function assignCourse(email, courseId){

    if(!courseId) return;

    fetch("http://127.0.0.1:5000/assign-course", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            course_id: courseId
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Course Assigned ✅");
    });
}


function deleteUser(email){

    const confirmDelete = confirm("Are you sure you want to delete this user?");

    if(!confirmDelete) return;

    fetch("http://127.0.0.1:5000/delete-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email })
    })
    .then(res => res.json())
    .then(data => {
        alert("User Deleted ❌");
        loadUsers(); // refresh table
    });
}

function loadAdminDashboard(){

    fetch("http://127.0.0.1:5000/admin-dashboard")
    .then(res => res.json())
    .then(data => {

        const totalUsersEl = document.getElementById("totalUsers");
        const totalStudentsEl = document.getElementById("totalStudents"); // ✅ fixed
        const feesCollectedEl = document.getElementById("feesCollected");
        const feesPendingEl = document.getElementById("feesPending");
        const feesExpectedEl = document.getElementById("feesExpected");
        const pendingStudentsAdmin = document.getElementById("pendingStudentsAdmin");

        if(totalUsersEl) totalUsersEl.innerText = data.total_users;
        if(totalStudentsEl) totalStudentsEl.innerText = data.students;

        if(feesExpectedEl){
            feesExpectedEl.innerText =
                "₹" + Number(data.total_fees).toLocaleString('en-IN');
        }

        if(feesCollectedEl){
            feesCollectedEl.innerText =
                "₹" + Number(data.collected).toLocaleString('en-IN');
        }

        if(feesPendingEl){
            feesPendingEl.innerText =
                "₹" + Number(data.pending).toLocaleString('en-IN');
        }

        if(pendingStudentsAdmin){
            pendingStudentsAdmin.innerText = `(${data.pending_students} Students)`;
        }

    });

}




function loadActivityLogs(){

    fetch("http://127.0.0.1:5000/activity-logs")
    .then(res => res.json())
    .then(data => {

        const container = document.getElementById("activityContainer");
        if(!container) return;

        container.innerHTML = "";

        if(data.length === 0){
            container.innerHTML = "<p class='text-gray-500'>No activity yet</p>";
            return;
        }

        data.slice(0, 10).forEach(log => {

            let icon = "activity";
            let iconColor = "text-gray-500";

            if(log.action.toLowerCase().includes("approved")){
                icon = "check-circle";
                iconColor = "text-green-600";
            }
            else if(log.action.toLowerCase().includes("rejected")){
                icon = "x-circle";
                iconColor = "text-red-600";
            }
            else if(log.action.toLowerCase().includes("added")){
                icon = "user-plus";
                iconColor = "text-blue-600";
            }
            else if(log.action.toLowerCase().includes("deleted")){
                icon = "trash-2";
                iconColor = "text-red-600";
            }
            else if(log.action.toLowerCase().includes("course")){
                icon = "graduation-cap";
                iconColor = "text-purple-600";
            }
        

            const item = `
            <div class="py-3 px-4 border-b hover:bg-gray-50 transition">

                <p class="font-semibold flex items-center gap-2">
                    <i data-lucide="${icon}"
                        class="w-6 h-6 ${iconColor}"></i>
                    <span>${log.action}</span>
                </p>

                <p class="text-sm text-gray-500 mt-1">
                    ${log.performed_by} • ${new Date(log.timestamp).toLocaleString()}
                </p>

            </div>
            `;

            container.innerHTML += item;
            lucide.createIcons();
        });

    })
    .catch(err => console.log("Activity Error:", err));
}

function openAddUserModal(){
    document.getElementById("addUserModal").classList.remove("hidden");
}

function closeAddUserModal(){
    document.getElementById("addUserModal").classList.add("hidden");
}

function submitNewUser(){

    const name = document.getElementById("newName").value;
    const email = document.getElementById("newEmail").value;
    const password = document.getElementById("newPassword").value;
    const role = document.getElementById("newRole").value;

    if(!name || !email || !password || !role){
        alert("All fields are required!");
        return;
    }

    fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            role: role
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("User Added Successfully ✅");

        closeAddUserModal();
        loadUsers();

        // clear inputs
        document.getElementById("newName").value = "";
        document.getElementById("newEmail").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("newRole").value = "";
    })
    .catch(err => {
        console.log(err);
        alert("Error adding user");
    });
}

function loadAuditLogs(){

    const table = document.getElementById("auditLogsTable");

    fetch("http://127.0.0.1:5000/activity-logs")
    .then(res => res.json())
    .then(data => {

        if(!table) return;

        table.innerHTML = "";

        data.forEach(log => {

            // 🔥 ADD DATE LOGIC HERE
            let formattedDate = "Invalid Date";
            if(log.timestamp){
                formattedDate = new Date(log.timestamp).toLocaleString();
            }

            // action text
            let actionText = log.action;

            // 🔥 THEN CREATE ROW
            const row = `
            <tr>
                <td>${formattedDate}</td>
                <td>${actionText}</td>
                <td>${log.performed_by}</td>
                <td>${log.role}</td>
            </tr>
            `;

            table.innerHTML += row;

        });

    });
}

function loadStudentBalance(){

    const email = localStorage.getItem("userEmail"); // your logged-in email

    fetch(`http://127.0.0.1:5000/student-balance/${email}`)
    .then(res => res.json())
    .then(data => {

        const pendingText = document.getElementById("pendingBalance");

        const amountInput = document.getElementById("amount");

        if(amountInput){
            amountInput.max = data.pending; // HTML restriction
        }
        if(pendingText){
            pendingText.innerText =
                 "Pending Balance: ₹" +
                    Number(data.pending).toLocaleString('en-IN');
        }

        // store for next step (validation)
        window.maxAllowedAmount = data.pending;

    });
}

function showModal(title, message, type="info"){

    const modalTitle = document.getElementById("modalTitle");

    modalTitle.innerText = title;

    // Remove old colors
    modalTitle.classList.remove(
        "text-red-600",
        "text-green-600",
        "text-yellow-600",
        "text-blue-600"
    );

    if(type === "success"){
        modalTitle.classList.add("text-green-600");
    }
    else if(type === "error"){
        modalTitle.classList.add("text-red-600");
    }
    else if(type === "warning"){
        modalTitle.classList.add("text-yellow-600");
    }
    else{
        modalTitle.classList.add("text-blue-600");
    }

    document.getElementById("modalBody").innerText = message;

    document.getElementById("messageModal")
        .classList.remove("hidden");
}


function deleteCourse(courseId, courseName){

    showConfirmModal(
        `Delete ${courseName}?\n\nThis action cannot be undone.`,
        function(){

            closeConfirmModal();

            fetch("http://127.0.0.1:5000/delete-course", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    course_id: courseId
                })
            })
            .then(res => res.json())
            .then(data => {

                if(data.message.includes("Cannot delete")){
                    showModal(
                        "Deletion Blocked",
                        data.message,
                        "error"
                    );
                }
                else{
                    showModal(
                        "Success",
                        data.message,
                        "success"
                    );

                    loadCourses();
                }

            })
            .catch(err => {
                console.log(err);
            });

        }
    );

}


function closeModal() {

    document
        .getElementById("messageModal")
        .classList.add("hidden");

}

function showConfirmModal(message, callback){

    document.getElementById("confirmMessage").innerText = message;

    document.getElementById("confirmModal")
        .classList.remove("hidden");

    document.getElementById("confirmDeleteBtn").onclick = callback;
}

function closeConfirmModal(){

    document.getElementById("confirmModal")
        .classList.add("hidden");
}

function toggleProcessedRequests(){

    showAllProcessed = !showAllProcessed;

    loadPendingRequests();

}