import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:5000";

function App() {
    // =========================================================
    // LOGIN
    // =========================================================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const [loginMessage, setLoginMessage] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    // =========================================================
    // ADMIN STATES
    // =========================================================

    const [showStudentManagement, setShowStudentManagement] =
        useState(false);

    const [showTeacherManagement, setShowTeacherManagement] =
        useState(false);

    const [showClassManagement, setShowClassManagement] =
        useState(false);

    const [showSubjectManagement, setShowSubjectManagement] =
        useState(false);

    const [showAssignmentManagement, setShowAssignmentManagement] =
        useState(false);

    // =========================================================
    // STUDENTS
    // =========================================================

    const [students, setStudents] = useState([]);

    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [studentRollNumber, setStudentRollNumber] = useState("");
    const [studentClassId, setStudentClassId] = useState("");

    const [studentMessage, setStudentMessage] = useState("");
    const [studentLoading, setStudentLoading] = useState(false);

    const [faceRegisteringStudentId, setFaceRegisteringStudentId] = useState(null);
    const [faceRegistrationMessage, setFaceRegistrationMessage] = useState("");
    const [faceCameraOpen, setFaceCameraOpen] = useState(false);
    const [faceCameraStudentId, setFaceCameraStudentId] = useState(null);
    const [faceCameraStream, setFaceCameraStream] = useState(null);
    const faceVideoRef = useRef(null);
    const faceCanvasRef = useRef(null);

    // =========================================================
    // TEACHERS
    // =========================================================

    const [teachers, setTeachers] = useState([]);

    const [teacherName, setTeacherName] = useState("");
    const [teacherEmail, setTeacherEmail] = useState("");
    const [teacherPassword, setTeacherPassword] = useState("");

    const [teacherMessage, setTeacherMessage] = useState("");
    const [teacherLoading, setTeacherLoading] = useState(false);

    // =========================================================
    // CLASSES
    // =========================================================

    const [classes, setClasses] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [classDepartmentId, setClassDepartmentId] = useState("");
    const [classYear, setClassYear] = useState("");
    const [classSection, setClassSection] = useState("");
    const [classAcademicYear, setClassAcademicYear] = useState("");

    const [classMessage, setClassMessage] = useState("");
    const [classLoading, setClassLoading] = useState(false);

    // =========================================================
    // SUBJECTS
    // =========================================================

    const [subjects, setSubjects] = useState([]);

    const [subjectName, setSubjectName] = useState("");
    const [subjectCode, setSubjectCode] = useState("");

    const [subjectMessage, setSubjectMessage] = useState("");
    const [subjectLoading, setSubjectLoading] = useState(false);

    // =========================================================
    // ASSIGNMENTS
    // =========================================================

    const [assignments, setAssignments] = useState([]);

    const [assignmentTeacherId, setAssignmentTeacherId] =
        useState("");

    const [assignmentSubjectId, setAssignmentSubjectId] =
        useState("");

    const [assignmentClassId, setAssignmentClassId] =
        useState("");

    const [assignmentMessage, setAssignmentMessage] =
        useState("");

    const [assignmentLoading, setAssignmentLoading] =
        useState(false);

    // =========================================================
    // TEACHER DASHBOARD
    // =========================================================

    const [showTeacherClasses, setShowTeacherClasses] =
        useState(false);

    const [showTeacherSubjects, setShowTeacherSubjects] =
        useState(false);

    const [showTeacherAttendanceHistory, setShowTeacherAttendanceHistory] =
        useState(false);

    const [teacherAttendanceHistory, setTeacherAttendanceHistory] =
        useState([]);

    const [teacherAttendanceHistoryLoading, setTeacherAttendanceHistoryLoading] =
        useState(false);

    const [teacherAttendanceHistoryMessage, setTeacherAttendanceHistoryMessage] =
        useState("");

    const [teacherAssignments, setTeacherAssignments] =
        useState([]);

    const [teacherAssignmentLoading, setTeacherAssignmentLoading] =
        useState(false);

    const [teacherAssignmentMessage, setTeacherAssignmentMessage] =
        useState("");

    // =========================================================
    // TAKE ATTENDANCE
    // =========================================================

    const [showTakeAttendance, setShowTakeAttendance] =
        useState(false);

    const [attendanceAssignments, setAttendanceAssignments] =
        useState([]);

    const [selectedAttendanceAssignment, setSelectedAttendanceAssignment] =
        useState("");

    const [attendanceStudents, setAttendanceStudents] =
        useState([]);

    const [attendanceStatuses, setAttendanceStatuses] =
        useState({});

    const [attendanceSession, setAttendanceSession] =
        useState(null);

    const [endedAttendanceSession, setEndedAttendanceSession] =
        useState(null);

    const [attendanceMessage, setAttendanceMessage] =
        useState("");

    const [attendanceLoading, setAttendanceLoading] =
        useState(false);

    const [attendanceSaving, setAttendanceSaving] =
        useState(false);

    // =========================================================
    // FACE RECOGNITION ATTENDANCE CAMERA
    // =========================================================

    const [recognitionCameraOpen, setRecognitionCameraOpen] =
        useState(false);

    const [recognitionCameraStream, setRecognitionCameraStream] =
        useState(null);

    const [recognitionMessage, setRecognitionMessage] =
        useState("");

    const [recognitionScanning, setRecognitionScanning] =
        useState(false);

    const [recognizedStudent, setRecognizedStudent] =
        useState(null);

    const recognitionVideoRef = useRef(null);
    const recognitionCanvasRef = useRef(null);
    const recognitionBusyRef = useRef(false);

    // =========================================================
    // STUDENT ATTENDANCE
    // =========================================================

    const [showStudentAttendance, setShowStudentAttendance] =
        useState(false);

    const [studentAttendance, setStudentAttendance] =
        useState(null);

    const [studentAttendanceLoading, setStudentAttendanceLoading] =
        useState(false);

    const [studentSubjectAttendance, setStudentSubjectAttendance] =
        useState([]);

    const [studentAttendanceHistory, setStudentAttendanceHistory] =
        useState([]);

    // =========================================================
    // COMMON HEADERS
    // =========================================================

    const getHeaders = () => {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        };
    };

    // =========================================================
    // LOGIN
    // =========================================================

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoginMessage("");
        setLoginLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setLoginMessage(
                    data.message || "Login failed"
                );
                return;
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            setToken(data.token);
            setUser(data.user);

            setEmail("");
            setPassword("");

        } catch (error) {
            console.error(error);

            setLoginMessage(
                "Unable to connect to backend"
            );
        } finally {
            setLoginLoading(false);
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken("");
        setUser(null);
    };

    // =========================================================
    // ADMIN - STUDENTS
    // =========================================================

    const loadStudents = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/students`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (data.success) {
                setStudents(data.data || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openStudentManagement = async () => {
        setShowStudentManagement(true);

        setShowTeacherManagement(false);
        setShowClassManagement(false);
        setShowSubjectManagement(false);
        setShowAssignmentManagement(false);

        setStudentMessage("");

        await loadClasses();
        await loadStudents();
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();

        setStudentMessage("");
        setStudentLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/students`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        name: studentName,
                        email: studentEmail,
                        roll_number: studentRollNumber,
                        class_id: Number(studentClassId)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setStudentMessage(
                    data.message ||
                    "Failed to create student"
                );
                return;
            }

            setStudentMessage(
                `Student created successfully! Initial password: ${data.credentials.initialPassword}`
            );

            setStudentName("");
            setStudentEmail("");
            setStudentRollNumber("");
            setStudentClassId("");

            await loadStudents();

        } catch (error) {
            console.error(error);

            setStudentMessage(
                "Unable to connect to backend"
            );
        } finally {
            setStudentLoading(false);
        }
    };

    const stopFaceCamera = () => {
        if (faceCameraStream) {
            faceCameraStream.getTracks().forEach((track) => track.stop());
        }

        if (faceVideoRef.current) {
            faceVideoRef.current.srcObject = null;
        }

        setFaceCameraStream(null);
        setFaceCameraOpen(false);
        setFaceCameraStudentId(null);
    };

    const openFaceCamera = async (studentId) => {
        setFaceRegistrationMessage("");

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setFaceRegistrationMessage(
                    "Camera access is not supported by this browser"
                );
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });

            setFaceCameraStream(stream);
            setFaceCameraStudentId(studentId);
            setFaceCameraOpen(true);
        } catch (error) {
            console.error("Camera access error:", error);
            setFaceRegistrationMessage(
                "Unable to access the camera. Please allow camera permission and try again."
            );
        }
    };

    useEffect(() => {
        if (faceCameraOpen && faceCameraStream && faceVideoRef.current) {
            faceVideoRef.current.srcObject = faceCameraStream;

            faceVideoRef.current.play().catch((error) => {
                console.error("Camera preview error:", error);
            });
        }
    }, [faceCameraOpen, faceCameraStream]);

    useEffect(() => {
        return () => {
            if (faceCameraStream) {
                faceCameraStream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [faceCameraStream]);

    const handleRegisterStudentFace = async (studentId) => {
        if (!faceVideoRef.current || !faceCanvasRef.current) {
            setFaceRegistrationMessage("Camera is not ready");
            return;
        }

        setFaceRegisteringStudentId(studentId);
        setFaceRegistrationMessage("");

        try {
            const video = faceVideoRef.current;
            const canvas = faceCanvasRef.current;

            if (
                video.readyState < 2 ||
                !video.videoWidth ||
                !video.videoHeight
            ) {
                setFaceRegistrationMessage(
                    "Camera is still starting. Please wait a moment and try again."
                );
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");

            if (!context) {
                setFaceRegistrationMessage(
                    "Unable to capture image from camera"
                );
                return;
            }

            context.drawImage(
                video,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const imageBlob = await new Promise((resolve) => {
                canvas.toBlob(resolve, "image/jpeg", 0.9);
            });

            if (!imageBlob) {
                setFaceRegistrationMessage(
                    "Unable to capture face image"
                );
                return;
            }

            const formData = new FormData();
            formData.append(
                "file",
                imageBlob,
                `student-${studentId}-face.jpg`
            );

            const aiResponse = await fetch(
                "http://127.0.0.1:8000/encode-face",
                {
                    method: "POST",
                    body: formData
                }
            );

            const aiData = await aiResponse.json();

            if (!aiResponse.ok || !aiData.success) {
                setFaceRegistrationMessage(
                    aiData.message || "Face encoding failed"
                );
                return;
            }

            const backendResponse = await fetch(
                `${API_URL}/api/face-recognition/register/${studentId}`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        encoding: aiData.encoding
                    })
                }
            );

            const backendData =
                await backendResponse.json();

            if (
                !backendResponse.ok ||
                !backendData.success
            ) {
                setFaceRegistrationMessage(
                    backendData.message ||
                    "Face registration failed"
                );
                return;
            }

            setFaceRegistrationMessage(
                `Face registered successfully for student ID ${studentId}.`
            );

            stopFaceCamera();

        } catch (error) {
            console.error(
                "Face registration error:",
                error
            );

            setFaceRegistrationMessage(
                "Unable to connect to the AI service or backend"
            );
        } finally {
            setFaceRegisteringStudentId(null);
        }
    };

    // =========================================================
    // ADMIN - TEACHERS
    // =========================================================

    const loadTeachers = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/teachers`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (data.success) {
                setTeachers(data.data || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openTeacherManagement = async () => {
        setShowTeacherManagement(true);

        setShowStudentManagement(false);
        setShowClassManagement(false);
        setShowSubjectManagement(false);
        setShowAssignmentManagement(false);

        setTeacherMessage("");

        await loadTeachers();
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();

        setTeacherMessage("");
        setTeacherLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/teachers`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        name: teacherName,
                        email: teacherEmail,
                        password: teacherPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setTeacherMessage(
                    data.message ||
                    "Failed to create teacher"
                );
                return;
            }

            setTeacherMessage(
                "Teacher created successfully!"
            );

            setTeacherName("");
            setTeacherEmail("");
            setTeacherPassword("");

            await loadTeachers();

        } catch (error) {
            console.error(error);

            setTeacherMessage(
                "Unable to connect to backend"
            );
        } finally {
            setTeacherLoading(false);
        }
    };

    // =========================================================
    // ADMIN - DEPARTMENTS
    // =========================================================

    const loadDepartments = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/departments`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (data.success) {
                setDepartments(data.data || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // =========================================================
    // ADMIN - CLASSES
    // =========================================================

    const loadClasses = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/classes`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (data.success) {
                setClasses(data.data || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openClassManagement = async () => {
        setShowClassManagement(true);

        setShowStudentManagement(false);
        setShowTeacherManagement(false);
        setShowSubjectManagement(false);
        setShowAssignmentManagement(false);

        setClassMessage("");

        await loadDepartments();
        await loadClasses();
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();

        setClassMessage("");
        setClassLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/classes`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        department_id:
                            Number(classDepartmentId),
                        year:
                            Number(classYear),
                        section:
                            classSection,
                        academic_year:
                            classAcademicYear
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setClassMessage(
                    data.message ||
                    "Failed to create class"
                );
                return;
            }

            setClassMessage(
                "Class created successfully!"
            );

            setClassDepartmentId("");
            setClassYear("");
            setClassSection("");
            setClassAcademicYear("");

            await loadClasses();

        } catch (error) {
            console.error(error);

            setClassMessage(
                "Unable to connect to backend"
            );
        } finally {
            setClassLoading(false);
        }
    };

    // =========================================================
    // ADMIN - SUBJECTS
    // =========================================================

    const loadSubjects = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/subjects`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (data.success) {
                setSubjects(data.data || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openSubjectManagement = async () => {
        setShowSubjectManagement(true);

        setShowStudentManagement(false);
        setShowTeacherManagement(false);
        setShowClassManagement(false);
        setShowAssignmentManagement(false);

        setSubjectMessage("");

        await loadSubjects();
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();

        setSubjectMessage("");
        setSubjectLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/subjects`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        name: subjectName,
                        code: subjectCode
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setSubjectMessage(
                    data.message ||
                    "Failed to create subject"
                );
                return;
            }

            setSubjectMessage(
                "Subject created successfully!"
            );

            setSubjectName("");
            setSubjectCode("");

            await loadSubjects();

        } catch (error) {
            console.error(error);

            setSubjectMessage(
                "Unable to connect to backend"
            );
        } finally {
            setSubjectLoading(false);
        }
    };

    // =========================================================
    // ADMIN - ASSIGNMENTS
    // =========================================================

    const loadAssignments = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/teacher-subjects`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (data.success) {
                setAssignments(data.data || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openAssignmentManagement = async () => {
        setShowAssignmentManagement(true);

        setShowStudentManagement(false);
        setShowTeacherManagement(false);
        setShowClassManagement(false);
        setShowSubjectManagement(false);

        setAssignmentMessage("");

        await loadTeachers();
        await loadSubjects();
        await loadClasses();
        await loadAssignments();
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();

        setAssignmentMessage("");
        setAssignmentLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/teacher-subjects`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        teacher_id:
                            Number(
                                assignmentTeacherId
                            ),
                        subject_id:
                            Number(
                                assignmentSubjectId
                            ),
                        class_id:
                            Number(
                                assignmentClassId
                            )
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setAssignmentMessage(
                    data.message ||
                    "Failed to assign subject"
                );
                return;
            }

            setAssignmentMessage(
                "Subject assigned to teacher successfully!"
            );

            setAssignmentTeacherId("");
            setAssignmentSubjectId("");
            setAssignmentClassId("");

            await loadAssignments();

        } catch (error) {
            console.error(error);

            setAssignmentMessage(
                "Unable to connect to backend"
            );
        } finally {
            setAssignmentLoading(false);
        }
    };

    // =========================================================
    // TEACHER - ASSIGNMENTS
    // =========================================================

    const loadTeacherAssignments = async () => {
        setTeacherAssignmentLoading(true);
        setTeacherAssignmentMessage("");

        try {
            const response = await fetch(
                `${API_URL}/api/teacher-subjects/my-assignments`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setTeacherAssignmentMessage(
                    data.message ||
                    "Failed to load assignments"
                );
                return;
            }

            setTeacherAssignments(
                data.data || []
            );

        } catch (error) {
            console.error(error);

            setTeacherAssignmentMessage(
                "Unable to connect to backend"
            );
        } finally {
            setTeacherAssignmentLoading(false);
        }
    };

    const openTeacherClasses = async () => {
        setShowTeacherClasses(true);
        setShowTeacherSubjects(false);
        setShowTakeAttendance(false);

        await loadTeacherAssignments();
    };

    const openTeacherSubjects = async () => {
        setShowTeacherSubjects(true);
        setShowTeacherClasses(false);
        setShowTakeAttendance(false);

        await loadTeacherAssignments();
    };

    // =========================================================
    // TEACHER ATTENDANCE HISTORY - OPEN
    // =========================================================

    const openTeacherAttendanceHistory = async () => {
        setShowTeacherAttendanceHistory(true);
        setShowTeacherClasses(false);
        setShowTeacherSubjects(false);
        setShowTakeAttendance(false);

        setTeacherAttendanceHistory([]);
        setTeacherAttendanceHistoryMessage("");
        setTeacherAttendanceHistoryLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/teacher-attendance-history`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setTeacherAttendanceHistoryMessage(
                    data.message ||
                    "Failed to load attendance history"
                );
                return;
            }

            setTeacherAttendanceHistory(
                data.data || []
            );
        } catch (error) {
            console.error(error);

            setTeacherAttendanceHistoryMessage(
                "Unable to connect to backend"
            );
        } finally {
            setTeacherAttendanceHistoryLoading(false);
        }
    };

    // =========================================================
    // GET ASSIGNMENT ID
    // =========================================================

    const getAssignmentId = (item) => {
        return (
            item.id ??
            item.teacher_subject_id ??
            item.assignment_id
        );
    };

    // =========================================================
    // TAKE ATTENDANCE - OPEN
    // =========================================================

    const openTakeAttendance = async () => {
        setShowTakeAttendance(true);

        setShowTeacherClasses(false);
        setShowTeacherSubjects(false);

        setAttendanceMessage("");
        setAttendanceSession(null);
        setAttendanceStudents([]);
        setAttendanceStatuses({});
        setSelectedAttendanceAssignment("");

        setAttendanceLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/teacher-subjects/my-assignments`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setAttendanceMessage(
                    data.message ||
                    "Failed to load your assignments"
                );
                return;
            }

            setAttendanceAssignments(
                data.data || []
            );

        } catch (error) {
            console.error(error);

            setAttendanceMessage(
                "Unable to connect to backend"
            );
        } finally {
            setAttendanceLoading(false);
        }
    };

    // =========================================================
    // TAKE ATTENDANCE - LOAD STUDENTS
    // =========================================================

    const loadAttendanceStudents = async (
        classId
    ) => {
        setAttendanceLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/attendance/class/${classId}/students`,
                {
                    headers: getHeaders()
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setAttendanceMessage(
                    data.message ||
                    "Failed to load students"
                );
                return;
            }

            const studentList =
                data.data || [];

            setAttendanceStudents(
                studentList
            );

            const initialStatuses = {};

            studentList.forEach(
                (student) => {
                    const studentId =
                        student.id ??
                        student.student_id;

                    if (studentId) {
                        initialStatuses[
                            studentId
                        ] = "ABSENT";
                    }
                }
            );

            setAttendanceStatuses(
                initialStatuses
            );

        } catch (error) {
            console.error(error);

            setAttendanceMessage(
                "Unable to load students"
            );
        } finally {
            setAttendanceLoading(false);
        }
    };

    // =========================================================
    // TAKE ATTENDANCE - SELECT ASSIGNMENT
    // =========================================================

    const handleAttendanceAssignmentChange = async (
        assignmentId
    ) => {
        setSelectedAttendanceAssignment(
            assignmentId
        );

        setAttendanceStudents([]);
        setAttendanceStatuses({});
        setAttendanceSession(null);
        setEndedAttendanceSession(null);
        setAttendanceMessage("");

        if (!assignmentId) {
            return;
        }

        const assignment =
            attendanceAssignments.find(
                (item) =>
                    String(
                        getAssignmentId(item)
                    ) ===
                    String(assignmentId)
            );

        if (!assignment) {
            setAttendanceMessage(
                "Assignment not found"
            );
            return;
        }

        await loadAttendanceStudents(
            assignment.class_id
        );
    };

    // =========================================================
    // LOAD EXISTING ATTENDANCE SESSION
    // =========================================================

    const loadExistingAttendanceSession = async (
        existingSession,
        assignment,
        preserveAttendance = false
    ) => {
        if (!existingSession) {
            setAttendanceMessage(
                "Existing attendance session could not be loaded."
            );
            return;
        }

        const sessionAssignmentId =
            existingSession.teacher_subject_id ??
            existingSession.assignment_id;

        const selectedAssignmentId =
            getAssignmentId(assignment);

        if (
            sessionAssignmentId !== undefined &&
            String(sessionAssignmentId) !==
                String(selectedAssignmentId)
        ) {
            setAttendanceMessage(
                "The existing session belongs to a different subject."
            );
            return;
        }

        const sessionId =
            existingSession.id ??
            existingSession.session_id ??
            existingSession.sessionId;

        if (!sessionId) {
            setAttendanceMessage(
                "Existing attendance session ID was not found."
            );
            return;
        }

        await loadAttendanceStudents(
            assignment.class_id
        );

        if (preserveAttendance) {
            try {
                const attendanceResponse = await fetch(
                    `${API_URL}/api/attendance/session/${sessionId}`,
                    {
                        headers: getHeaders()
                    }
                );

                const attendanceData =
                    await attendanceResponse.json();

                if (
                    attendanceResponse.ok &&
                    attendanceData.success
                ) {
                    const existingStatuses = {};

                    (attendanceData.data || []).forEach(
                        (record) => {
                            const studentId =
                                record.student_id ??
                                record.id;

                            if (studentId && record.status) {
                                existingStatuses[
                                    studentId
                                ] = record.status;
                            }
                        }
                    );

                    setAttendanceStatuses(
                        (previous) => ({
                            ...previous,
                            ...existingStatuses
                        })
                    );
                }
            } catch (error) {
                console.error(
                    "Error loading existing attendance:",
                    error
                );
            }
        }

        setAttendanceSession({
            ...existingSession,
            id: Number(sessionId),
            session_id: Number(sessionId)
        });

        setEndedAttendanceSession(null);

        setAttendanceMessage(
            preserveAttendance
                ? "Today's attendance session reopened successfully. Previous attendance has been preserved."
                : "Existing attendance session loaded successfully!"
        );
    };


    // =========================================================
    // CREATE OR LOAD ATTENDANCE SESSION
    // =========================================================

    const createAttendanceSession = async () => {
        if (!selectedAttendanceAssignment) {
            setAttendanceMessage(
                "Please select a subject and class first"
            );
            return;
        }

        const assignment =
            attendanceAssignments.find(
                (item) =>
                    String(
                        getAssignmentId(item)
                    ) ===
                    String(
                        selectedAttendanceAssignment
                    )
            );

        if (!assignment) {
            setAttendanceMessage(
                "Assignment not found"
            );
            return;
        }

        setAttendanceLoading(true);
        setAttendanceMessage("");

        try {
            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];

            const currentTime =
                new Date()
                    .toTimeString()
                    .split(" ")[0];

            const teacherSubjectId =
                getAssignmentId(
                    assignment
                );

            const response = await fetch(
                `${API_URL}/api/attendance-sessions`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        teacher_subject_id:
                            Number(
                                teacherSubjectId
                            ),
                        session_date:
                            today,
                        start_time:
                            currentTime
                    })
                }
            );

            const data = await response.json();

            /*
             * If the backend says that the session already
             * exists,
             * use the session returned by the backend.
             *
             * IMPORTANT:
             * Never use a hard-coded session ID.
             */
            if (
                response.status === 409 &&
                data.existingSession
            ) {
                if (data.sessionType === "ENDED") {
                    setAttendanceSession(null);
                    setEndedAttendanceSession(
                        data.existingSession
                    );
                    stopRecognitionCamera();
                    setAttendanceMessage(
                        data.message ||
                        "Today's attendance session has ended. You can reopen it today."
                    );
                } else {
                    await loadExistingAttendanceSession(
                        data.existingSession,
                        assignment,
                        false
                    );
                }

                return;
            }

            /*
             * Compatibility fallback in case the backend returns
             * the duplicate message with a different HTTP status.
             */
            if (
                data.existingSession &&
                data.message &&
                data.message.includes(
                    "Attendance session already exists"
                )
            ) {
                await loadExistingAttendanceSession(
                    data.existingSession,
                    assignment,
                    false
                );
                return;
            }

            if (!response.ok || !data.success) {
                setAttendanceMessage(
                    data.message ||
                    "Failed to create attendance session"
                );
                return;
            }

            const newSession =
                data.data || {
                    id:
                        data.sessionId ||
                        data.session_id ||
                        data.id
                };

            setAttendanceSession({
                ...newSession,
                id: Number(
                    newSession.id ??
                    newSession.session_id ??
                    newSession.sessionId
                ),
                session_id: Number(
                    newSession.id ??
                    newSession.session_id ??
                    newSession.sessionId
                )
            });

            setEndedAttendanceSession(null);

            // Every student starts ABSENT in a brand-new session.
            await loadAttendanceStudents(
                assignment.class_id
            );

            setAttendanceMessage(
                "Attendance session created successfully. All students are ABSENT until recognized by camera."
            );

        } catch (error) {
            console.error(error);

            setAttendanceMessage(
                "Unable to create attendance session"
            );
        } finally {
            setAttendanceLoading(false);
        }
    };

    // =========================================================
    // REOPEN TODAY'S ATTENDANCE SESSION
    // =========================================================

    const reopenAttendanceSession = async () => {
        if (!endedAttendanceSession) {
            return;
        }

        const sessionId =
            endedAttendanceSession.id ??
            endedAttendanceSession.session_id ??
            endedAttendanceSession.sessionId;

        if (!sessionId) {
            setAttendanceMessage(
                "Attendance session ID was not found."
            );
            return;
        }

        const assignment =
            attendanceAssignments.find(
                (item) =>
                    String(
                        getAssignmentId(item)
                    ) ===
                    String(
                        selectedAttendanceAssignment
                    )
            );

        if (!assignment) {
            setAttendanceMessage(
                "Assignment not found."
            );
            return;
        }

        setAttendanceLoading(true);
        setAttendanceMessage("");

        try {
            const response = await fetch(
                `${API_URL}/api/attendance-sessions/${sessionId}/reopen`,
                {
                    method: "PUT",
                    headers: getHeaders()
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                setAttendanceMessage(
                    data.message ||
                    "Unable to reopen attendance session."
                );
                return;
            }

            const reopenedSession =
                data.data || endedAttendanceSession;

            await loadExistingAttendanceSession(
                reopenedSession,
                assignment,
                true
            );

        } catch (error) {
            console.error(
                "Reopen attendance session error:",
                error
            );

            setAttendanceMessage(
                "Unable to reopen attendance session."
            );
        } finally {
            setAttendanceLoading(false);
        }
    };

    // =========================================================
    // CHANGE ATTENDANCE STATUS
    // =========================================================

    const handleAttendanceStatusChange = (
        studentId,
        status
    ) => {
        setAttendanceStatuses(
            (previous) => ({
                ...previous,
                [studentId]:
                    status
            })
        );
    };

    // =========================================================
    // SAVE ATTENDANCE
    // =========================================================

    const saveAttendance = async () => {
        if (!attendanceSession) {
            setAttendanceMessage(
                "Please create or load an attendance session first"
            );
            return;
        }

        if (attendanceStudents.length === 0) {
            setAttendanceMessage(
                "No students found"
            );
            return;
        }

        setAttendanceSaving(true);
        setAttendanceMessage("");

        try {
            const sessionId =
                attendanceSession.id ??
                attendanceSession.session_id ??
                attendanceSession.sessionId;

            if (!sessionId) {
                setAttendanceMessage(
                    "Attendance session ID was not found"
                );
                return;
            }

            /*
             * IMPORTANT:
             *
             * Convert every student into exactly:
             *
             * {
             *     student_id: number,
             *     status: "ABSENT" by default,
             *     changed to "PRESENT" only after face recognition
             * }
             *
             * This fixes:
             * "Each attendance record requires student_id and status"
             */

            const records =
                attendanceStudents.map(
                    (student) => {
                        const studentId =
                            Number(
                                student.id ??
                                student.student_id
                            );

                        const status =
                            attendanceStatuses[
                                student.id ??
                                student.student_id
                            ] ||
                            "ABSENT";

                        return {
                            student_id:
                                studentId,
                            status:
                                status
                        };
                    }
                );

            /*
             * Check that every record has
             * student_id and status.
             */

            const invalidRecord =
                records.find(
                    (record) =>
                        !Number.isInteger(
                            record.student_id
                        ) ||
                        record.student_id <=
                            0 ||
                        !record.status
                );

            if (invalidRecord) {
                console.error(
                    "Invalid attendance record:",
                    invalidRecord
                );

                setAttendanceMessage(
                    "Invalid student attendance data. Please refresh and try again."
                );

                return;
            }

            console.log(
                "Attendance session ID:",
                sessionId
            );

            console.log(
                "Attendance records being sent:",
                records
            );

            const response = await fetch(
                `${API_URL}/api/attendance/bulk`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        session_id:
                            Number(
                                sessionId
                            ),
                        attendance:
                            records
                    })
                }
            );

            const data =
                await response.json();

            console.log(
                "Attendance API response:",
                data
            );

            if (
                !response.ok ||
                !data.success
            ) {
                setAttendanceMessage(
                    data.message ||
                    "Failed to save attendance"
                );
                return;
            }

            setAttendanceMessage(
                "Attendance saved successfully!"
            );

        } catch (error) {
            console.error(
                "Save attendance error:",
                error
            );

            setAttendanceMessage(
                "Unable to save attendance"
            );

        } finally {
            setAttendanceSaving(false);
        }
    };

    // =========================================================
    // END SESSION
    // =========================================================

    const endAttendanceSession = async () => {
        if (!attendanceSession) {
            return;
        }

        const sessionId =
            attendanceSession.id ??
            attendanceSession.session_id ??
            attendanceSession.sessionId;

        if (!sessionId) {
            setAttendanceMessage(
                "Attendance session ID was not found"
            );
            return;
        }

        setAttendanceLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/attendance-sessions/${sessionId}/end`,
                {
                    method: "PUT",
                    headers: getHeaders()
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                setAttendanceMessage(
                    data.message ||
                    "Failed to end session"
                );
                return;
            }

            setEndedAttendanceSession({
                ...attendanceSession,
                ...(data.data || {}),
                id: Number(
                    data.data?.id ??
                    attendanceSession.id ??
                    attendanceSession.session_id
                ),
                session_id: Number(
                    data.data?.id ??
                    attendanceSession.id ??
                    attendanceSession.session_id
                )
            });

            setAttendanceSession(null);
            stopRecognitionCamera();

            setAttendanceMessage(
                "Attendance session ended successfully. You can reopen it today if needed."
            );

        } catch (error) {
            console.error(error);

            setAttendanceMessage(
                "Unable to end attendance session"
            );
        } finally {
            setAttendanceLoading(false);
        }
    };

    // =========================================================
    // FACE RECOGNITION ATTENDANCE CAMERA
    // =========================================================

    const stopRecognitionCamera = () => {
        if (recognitionCameraStream) {
            recognitionCameraStream
                .getTracks()
                .forEach((track) => track.stop());
        }

        if (recognitionVideoRef.current) {
            recognitionVideoRef.current.srcObject = null;
        }

        setRecognitionCameraStream(null);
        setRecognitionCameraOpen(false);
        setRecognitionScanning(false);
        recognitionBusyRef.current = false;
    };


    const openRecognitionCamera = async () => {
        if (!attendanceSession) {
            setRecognitionMessage(
                "Please create or load an attendance session first."
            );
            return;
        }

        setRecognitionMessage("");
        setRecognizedStudent(null);

        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                setRecognitionMessage(
                    "Camera access is not supported by this browser."
                );
                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                });

            setRecognitionCameraStream(stream);
            setRecognitionCameraOpen(true);

        } catch (error) {
            console.error(
                "Recognition camera access error:",
                error
            );

            setRecognitionMessage(
                "Unable to access the camera. Please allow camera permission and try again."
            );
        }
    };


    useEffect(() => {
        if (
            recognitionCameraOpen &&
            recognitionCameraStream &&
            recognitionVideoRef.current
        ) {
            recognitionVideoRef.current.srcObject =
                recognitionCameraStream;

            recognitionVideoRef.current
                .play()
                .catch((error) => {
                    console.error(
                        "Recognition camera preview error:",
                        error
                    );
                });
        }
    }, [
        recognitionCameraOpen,
        recognitionCameraStream
    ]);


    useEffect(() => {
        return () => {
            if (recognitionCameraStream) {
                recognitionCameraStream
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, [recognitionCameraStream]);


    const captureAndRecognizeFace = async () => {
        if (recognitionBusyRef.current) {
            return;
        }

        if (!recognitionVideoRef.current) {
            setRecognitionMessage(
                "Camera is not ready."
            );
            return;
        }

        if (!recognitionCanvasRef.current) {
            setRecognitionMessage(
                "Unable to prepare camera capture."
            );
            return;
        }

        if (!attendanceSession) {
            setRecognitionMessage(
                "Attendance session is not active."
            );
            return;
        }

        recognitionBusyRef.current = true;
        setRecognitionScanning(true);
        setRecognitionMessage("");

        try {
            const video =
                recognitionVideoRef.current;

            const canvas =
                recognitionCanvasRef.current;

            if (
                video.readyState < 2 ||
                !video.videoWidth ||
                !video.videoHeight
            ) {
                setRecognitionMessage(
                    "Camera is still starting. Please wait a moment and try again."
                );
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context =
                canvas.getContext("2d");

            if (!context) {
                setRecognitionMessage(
                    "Unable to capture image from camera."
                );
                return;
            }

            context.drawImage(
                video,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const imageBlob =
                await new Promise((resolve) => {
                    canvas.toBlob(
                        resolve,
                        "image/jpeg",
                        0.9
                    );
                });

            if (!imageBlob) {
                setRecognitionMessage(
                    "Unable to capture face image."
                );
                return;
            }

            // -------------------------------------------------
            // Send camera image to AI service
            // -------------------------------------------------

            const formData =
                new FormData();

            formData.append(
                "file",
                imageBlob,
                "attendance-face.jpg"
            );

            const aiResponse =
                await fetch(
                    "http://127.0.0.1:8000/recognize-face",
                    {
                        method: "POST",
                        body: formData
                    }
                );

            const aiData =
                await aiResponse.json();

            if (
                !aiResponse.ok ||
                !aiData.success ||
                !aiData.encoding
            ) {
                setRecognitionMessage(
                    aiData.message ||
                    "AI face detection failed."
                );
                return;
            }

            // -------------------------------------------------
            // Send encoding to Node.js backend
            // -------------------------------------------------

            const backendResponse =
                await fetch(
                    `${API_URL}/api/face-recognition/recognize`,
                    {
                        method: "POST",
                        headers: getHeaders(),
                        body: JSON.stringify({
                            encoding:
                                aiData.encoding,
                            session_id:
                                Number(
                                    attendanceSession.id ??
                                    attendanceSession.session_id ??
                                    attendanceSession.sessionId
                                )
                        })
                    }
                );

            const backendData =
                await backendResponse.json();

            if (
                !backendResponse.ok ||
                !backendData.success
            ) {
                setRecognitionMessage(
                    backendData.message ||
                    "Face recognition failed."
                );
                return;
            }

            // -------------------------------------------------
            // Face not recognized
            // -------------------------------------------------

            if (
                !backendData.recognized ||
                !backendData.student
            ) {
                setRecognizedStudent(null);

                setRecognitionMessage(
                    backendData.message ||
                    "Face not recognized. Please try again."
                );

                return;
            }

            const student =
                backendData.student;

            setRecognizedStudent(student);

            // -------------------------------------------------
            // Get current attendance session ID
            // -------------------------------------------------

            const sessionId =
                attendanceSession.id ??
                attendanceSession.session_id ??
                attendanceSession.sessionId;

            if (!sessionId) {
                setRecognitionMessage(
                    "Attendance session ID was not found."
                );
                return;
            }

            // -------------------------------------------------
            // Mark recognized student PRESENT
            // -------------------------------------------------

            const attendanceResponse =
                await fetch(
                    `${API_URL}/api/attendance`,
                    {
                        method: "POST",
                        headers: getHeaders(),
                        body: JSON.stringify({
                            session_id:
                                Number(sessionId),
                            student_id:
                                Number(student.id),
                            status:
                                "PRESENT"
                        })
                    }
                );

            const attendanceData =
                await attendanceResponse.json();

            if (
                !attendanceResponse.ok ||
                !attendanceData.success
            ) {
                setRecognitionMessage(
                    attendanceData.message ||
                    "Student recognized, but attendance could not be saved."
                );
                return;
            }

            // -------------------------------------------------
            // Update the attendance table
            // -------------------------------------------------

            setAttendanceStatuses(
                (previous) => ({
                    ...previous,
                    [student.id]:
                        "PRESENT"
                })
            );

            setRecognitionMessage(
                `Attendance marked successfully for ${student.name} (${student.roll_number}).`
            );

            // Automatically close the camera after successful attendance.
            setTimeout(() => {
                stopRecognitionCamera();
            }, 1200);

        } catch (error) {
            console.error(
                "Face recognition attendance error:",
                error
            );

            setRecognitionMessage(
                "Unable to connect to the AI service or backend."
            );

        } finally {
            recognitionBusyRef.current = false;
            setRecognitionScanning(false);
        }
    };


    // =========================================================
    // STUDENT ATTENDANCE
    // =========================================================

    const openStudentAttendance = async () => {
        setShowStudentAttendance(true);

        setStudentAttendanceLoading(true);

        try {
            // =====================================================
            // STEP 1: FIND THE LOGGED-IN STUDENT
            // =====================================================

            const studentResponse = await fetch(
                `${API_URL}/api/students/me`,
                {
                    headers: getHeaders()
                }
            );

            const studentData =
                await studentResponse.json();

            if (
                !studentResponse.ok ||
                !studentData.success
            ) {
                console.error(
                    studentData.message ||
                    "Failed to load student details"
                );
                return;
            }

            const currentStudent =
                studentData.data;

            if (!currentStudent) {
                console.error(
                    "Student record not found"
                );
                return;
            }

            const studentId =
                currentStudent.id;

            console.log(
                "Logged-in student ID:",
                studentId
            );


            // =====================================================
            // STEP 2: LOAD OVERALL ATTENDANCE
            // =====================================================

            const attendanceResponse =
                await fetch(
                    `${API_URL}/api/student-attendance/student/${studentId}`,
                    {
                        headers: getHeaders()
                    }
                );

            const attendanceData =
                await attendanceResponse.json();

            if (
                !attendanceResponse.ok ||
                !attendanceData.success
            ) {
                console.error(
                    attendanceData.message ||
                    "Failed to load attendance"
                );
                return;
            }

            setStudentAttendance(
                attendanceData.data
            );


            // =====================================================
            // STEP 3: LOAD SUBJECT-WISE ATTENDANCE
            // =====================================================

            const subjectResponse =
                await fetch(
                    `${API_URL}/api/student-attendance/student/${studentId}/subjects`,
                    {
                        headers: getHeaders()
                    }
                );

            const subjectData =
                await subjectResponse.json();

            if (
                subjectResponse.ok &&
                subjectData.success
            ) {
                setStudentSubjectAttendance(
                    subjectData.data || []
                );
            } else {
                console.error(
                    subjectData.message ||
                    "Failed to load subject attendance"
                );

                setStudentSubjectAttendance([]);
            }


            // =====================================================
            // STEP 4: LOAD ATTENDANCE HISTORY
            // =====================================================

            const historyResponse =
                await fetch(
                    `${API_URL}/api/student-attendance/student/${studentId}/history`,
                    {
                        headers: getHeaders()
                    }
                );

            const historyData =
                await historyResponse.json();

            if (
                historyResponse.ok &&
                historyData.success
            ) {
                setStudentAttendanceHistory(
                    historyData.data || []
                );
            } else {
                console.error(
                    historyData.message ||
                    "Failed to load attendance history"
                );

                setStudentAttendanceHistory([]);
            }

        } catch (error) {
            console.error(
                "Student attendance error:",
                error
            );

        } finally {
            setStudentAttendanceLoading(
                false
            );
        }
    };
    // =========================================================
    // LOGIN SCREEN
    // =========================================================

    if (!token || !user) {
        return (
            <div style={loginPageStyle}>

                <div style={loginBoxStyle}>

                    <h1
                        style={{
                            textAlign:
                                "center"
                        }}
                    >
                        AI Attendance System
                    </h1>

                    <p
                        style={{
                            textAlign:
                                "center",
                            color:
                                "#666",
                            marginBottom:
                                "30px"
                        }}
                    >
                        Login to continue
                    </p>

                    <form
                        onSubmit={
                            handleLogin
                        }
                    >

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            value={
                                email
                            }
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            placeholder="Enter email"
                            style={
                                inputStyle
                            }
                            required
                        />

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={
                                password
                            }
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Enter password"
                            style={
                                inputStyle
                            }
                            required
                        />

                        <button
                            type="submit"
                            disabled={
                                loginLoading
                            }
                            style={
                                primaryButtonStyle
                            }
                        >
                            {loginLoading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    {loginMessage && (
                        <p
                            style={{
                                color:
                                    "red",
                                textAlign:
                                    "center"
                            }}
                        >
                            {
                                loginMessage
                            }
                        </p>
                    )}

                </div>

            </div>
        );
    }

    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    if (user.role === "ADMIN") {
        return (
            <div style={pageStyle}>

                <div style={headerStyle}>

                    <div>
                        <h1 style={dashboardTitleStyle}>Admin Dashboard</h1>

                        <p>
                            Welcome,{" "}
                            {
                                user.name
                            }
                        </p>
                    </div>

                    <button
                        onClick={
                            handleLogout
                        }
                        style={
                            logoutButtonStyle
                        }
                    >
                        Logout
                    </button>

                </div>

                {!showStudentManagement &&
                    !showTeacherManagement &&
                    !showClassManagement &&
                    !showSubjectManagement &&
                    !showAssignmentManagement && (

                        <div>

                            <h2 style={sectionTitleStyle}>Administration</h2>

                            <div
                                style={
                                    cardGridStyle
                                }
                            >

                                <DashboardCard
                                    title="Manage Students"
                                    description="Add and view students"
                                    onClick={
                                        openStudentManagement
                                    }
                                />

                                <DashboardCard
                                    title="Manage Teachers"
                                    description="Add and view teachers"
                                    onClick={
                                        openTeacherManagement
                                    }
                                />

                                <DashboardCard
                                    title="Manage Classes"
                                    description="Create and view classes"
                                    onClick={
                                        openClassManagement
                                    }
                                />

                                <DashboardCard
                                    title="Manage Subjects"
                                    description="Create and view subjects"
                                    onClick={
                                        openSubjectManagement
                                    }
                                />

                                <DashboardCard
                                    title="Assign Subject to Teacher"
                                    description="Assign subjects and classes to teachers"
                                    onClick={
                                        openAssignmentManagement
                                    }
                                />

                            </div>

                        </div>
                    )}

                {/* =================================================
                    STUDENTS
                ================================================= */}

                {showStudentManagement && (
                    <ManagementContainer
                        title="Manage Students"
                        onBack={() =>
                            setShowStudentManagement(
                                false
                            )
                        }
                    >

                        <form
                            onSubmit={
                                handleCreateStudent
                            }
                            style={
                                formStyle
                            }
                        >

                            <h3>
                                Add Student
                            </h3>

                            <input
                                value={
                                    studentName
                                }
                                onChange={(e) =>
                                    setStudentName(
                                        e.target.value
                                    )
                                }
                                placeholder="Student name"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <input
                                type="email"
                                value={
                                    studentEmail
                                }
                                onChange={(e) =>
                                    setStudentEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="Student email"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <input
                                value={
                                    studentRollNumber
                                }
                                onChange={(e) =>
                                    setStudentRollNumber(
                                        e.target.value
                                    )
                                }
                                placeholder="Roll number"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <select
                                value={
                                    studentClassId
                                }
                                onChange={(e) =>
                                    setStudentClassId(
                                        e.target.value
                                    )
                                }
                                style={
                                    inputStyle
                                }
                                required
                            >

                                <option value="">
                                    Select Class
                                </option>

                                {classes.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.department_code
                                            }{" "}
                                            - Year{" "}
                                            {
                                                item.year
                                            }{" "}
                                            - Section{" "}
                                            {
                                                item.section
                                            }{" "}
                                            -{" "}
                                            {
                                                item.academic_year
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <button
                                type="submit"
                                disabled={
                                    studentLoading
                                }
                                style={
                                    primaryButtonStyle
                                }
                            >
                                {studentLoading
                                    ? "Creating..."
                                    : "Add Student"}
                            </button>

                            {studentMessage && (
                                <p
                                    style={{
                                        color:
                                            studentMessage.includes(
                                                "successfully"
                                            )
                                                ? "green"
                                                : "red"
                                    }}
                                >
                                    {
                                        studentMessage
                                    }
                                </p>
                            )}

                        </form>

                        <h3>
                            Students
                        </h3>

                        <DataTable>

                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        Name
                                    </th>
                                    <th>
                                        Email
                                    </th>
                                    <th>
                                        Roll Number
                                    </th>
                                    <th>
                                        Class
                                    </th>
                                    <th>
                                        Register Face
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {students.map(
                                    (
                                        item
                                    ) => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            <td>
                                                {
                                                    item.id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.email
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.roll_number
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.department_code
                                                }{" "}
                                                - Year{" "}
                                                {
                                                    item.year
                                                }{" "}
                                                - Section{" "}
                                                {
                                                    item.section
                                                }
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => openFaceCamera(item.id)}
                                                    disabled={
                                                        faceRegisteringStudentId === item.id
                                                    }
                                                    style={primaryButtonStyle}
                                                >
                                                    Register Face
                                                </button>

                                                {faceRegisteringStudentId === item.id && (
                                                    <p>Processing...</p>
                                                )}
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </DataTable>

                        {faceCameraOpen && (
                            <div
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    zIndex: 1000,
                                    padding: "20px"
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: "white",
                                        borderRadius: "12px",
                                        padding: "20px",
                                        width: "min(700px, 95vw)",
                                        textAlign: "center"
                                    }}
                                >
                                    <h3>Register Student Face</h3>

                                    <p>
                                        Ask the student to look directly at the camera.
                                        Make sure only one face is visible.
                                    </p>

                                    <video
                                        ref={faceVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{
                                            width: "100%",
                                            maxWidth: "640px",
                                            borderRadius: "10px",
                                            backgroundColor: "#000"
                                        }}
                                    />

                                    <canvas
                                        ref={faceCanvasRef}
                                        style={{ display: "none" }}
                                    />

                                    <div
                                        style={{
                                            marginTop: "15px",
                                            display: "flex",
                                            gap: "10px",
                                            justifyContent: "center",
                                            flexWrap: "wrap"
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRegisterStudentFace(
                                                    faceCameraStudentId
                                                )
                                            }
                                            disabled={
                                                faceRegisteringStudentId !== null
                                            }
                                            style={primaryButtonStyle}
                                        >
                                            {faceRegisteringStudentId !== null
                                                ? "Processing..."
                                                : "Capture & Register Face"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={stopFaceCamera}
                                            disabled={
                                                faceRegisteringStudentId !== null
                                            }
                                            style={logoutButtonStyle}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {faceRegistrationMessage && (
                            <p
                                style={{
                                    marginTop: "15px",
                                    color: faceRegistrationMessage.includes("successfully") ? "green" : "red"
                                }}
                            >
                                {faceRegistrationMessage}
                            </p>
                        )}

                    </ManagementContainer>
                )}

                {/* =================================================
                    TEACHERS
                ================================================= */}

                {showTeacherManagement && (
                    <ManagementContainer
                        title="Manage Teachers"
                        onBack={() =>
                            setShowTeacherManagement(
                                false
                            )
                        }
                    >

                        <form
                            onSubmit={
                                handleCreateTeacher
                            }
                            style={
                                formStyle
                            }
                        >

                            <h3>
                                Add Teacher
                            </h3>

                            <input
                                value={
                                    teacherName
                                }
                                onChange={(e) =>
                                    setTeacherName(
                                        e.target.value
                                    )
                                }
                                placeholder="Teacher name"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <input
                                type="email"
                                value={
                                    teacherEmail
                                }
                                onChange={(e) =>
                                    setTeacherEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="Teacher email"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <input
                                type="password"
                                value={
                                    teacherPassword
                                }
                                onChange={(e) =>
                                    setTeacherPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Password"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <button
                                type="submit"
                                disabled={
                                    teacherLoading
                                }
                                style={
                                    primaryButtonStyle
                                }
                            >
                                {teacherLoading
                                    ? "Creating..."
                                    : "Add Teacher"}
                            </button>

                            {teacherMessage && (
                                <p
                                    style={{
                                        color:
                                            teacherMessage.includes(
                                                "successfully"
                                            )
                                                ? "green"
                                                : "red"
                                    }}
                                >
                                    {
                                        teacherMessage
                                    }
                                </p>
                            )}

                        </form>

                        <h3>
                            Teachers
                        </h3>

                        <DataTable>

                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        Name
                                    </th>
                                    <th>
                                        Email
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {teachers.map(
                                    (
                                        item
                                    ) => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            <td>
                                                {
                                                    item.id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.email
                                                }
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </DataTable>

                    </ManagementContainer>
                )}

                {/* =================================================
                    CLASSES
                ================================================= */}

                {showClassManagement && (
                    <ManagementContainer
                        title="Manage Classes"
                        onBack={() =>
                            setShowClassManagement(
                                false
                            )
                        }
                    >

                        <form
                            onSubmit={
                                handleCreateClass
                            }
                            style={
                                formStyle
                            }
                        >

                            <h3>
                                Add Class
                            </h3>

                            <select
                                value={
                                    classDepartmentId
                                }
                                onChange={(e) =>
                                    setClassDepartmentId(
                                        e.target.value
                                    )
                                }
                                style={
                                    inputStyle
                                }
                                required
                            >

                                <option value="">
                                    Select Department
                                </option>

                                {departments.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.code
                                            }{" "}
                                            -{" "}
                                            {
                                                item.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <select
                                value={
                                    classYear
                                }
                                onChange={(e) =>
                                    setClassYear(
                                        e.target.value
                                    )
                                }
                                style={
                                    inputStyle
                                }
                                required
                            >

                                <option value="">
                                    Select Year
                                </option>

                                <option value="1">
                                    1st Year
                                </option>

                                <option value="2">
                                    2nd Year
                                </option>

                                <option value="3">
                                    3rd Year
                                </option>

                                <option value="4">
                                    4th Year
                                </option>

                            </select>

                            <input
                                value={
                                    classSection
                                }
                                onChange={(e) =>
                                    setClassSection(
                                        e.target.value
                                    )
                                }
                                placeholder="Section"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <input
                                value={
                                    classAcademicYear
                                }
                                onChange={(e) =>
                                    setClassAcademicYear(
                                        e.target.value
                                    )
                                }
                                placeholder="2026-2027"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <button
                                type="submit"
                                disabled={
                                    classLoading
                                }
                                style={
                                    primaryButtonStyle
                                }
                            >
                                {classLoading
                                    ? "Creating..."
                                    : "Add Class"}
                            </button>

                            {classMessage && (
                                <p
                                    style={{
                                        color:
                                            classMessage.includes(
                                                "successfully"
                                            )
                                                ? "green"
                                                : "red"
                                    }}
                                >
                                    {
                                        classMessage
                                    }
                                </p>
                            )}

                        </form>

                        <h3>
                            Classes
                        </h3>

                        <DataTable>

                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        Department
                                    </th>
                                    <th>
                                        Year
                                    </th>
                                    <th>
                                        Section
                                    </th>
                                    <th>
                                        Academic Year
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {classes.map(
                                    (
                                        item
                                    ) => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            <td>
                                                {
                                                    item.id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.department_code
                                                }{" "}
                                                -{" "}
                                                {
                                                    item.department_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.year
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.section
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.academic_year
                                                }
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </DataTable>

                    </ManagementContainer>
                )}

                {/* =================================================
                    SUBJECTS
                ================================================= */}

                {showSubjectManagement && (
                    <ManagementContainer
                        title="Manage Subjects"
                        onBack={() =>
                            setShowSubjectManagement(
                                false
                            )
                        }
                    >

                        <form
                            onSubmit={
                                handleCreateSubject
                            }
                            style={
                                formStyle
                            }
                        >

                            <h3>
                                Add Subject
                            </h3>

                            <input
                                value={
                                    subjectName
                                }
                                onChange={(e) =>
                                    setSubjectName(
                                        e.target.value
                                    )
                                }
                                placeholder="Subject name"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <input
                                value={
                                    subjectCode
                                }
                                onChange={(e) =>
                                    setSubjectCode(
                                        e.target.value
                                    )
                                }
                                placeholder="Subject code"
                                style={
                                    inputStyle
                                }
                                required
                            />

                            <button
                                type="submit"
                                disabled={
                                    subjectLoading
                                }
                                style={
                                    primaryButtonStyle
                                }
                            >
                                {subjectLoading
                                    ? "Creating..."
                                    : "Add Subject"}
                            </button>

                            {subjectMessage && (
                                <p
                                    style={{
                                        color:
                                            subjectMessage.includes(
                                                "successfully"
                                            )
                                                ? "green"
                                                : "red"
                                    }}
                                >
                                    {
                                        subjectMessage
                                    }
                                </p>
                            )}

                        </form>

                        <h3>
                            Subjects
                        </h3>

                        <DataTable>

                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        Subject
                                    </th>
                                    <th>
                                        Code
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {subjects.map(
                                    (
                                        item
                                    ) => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            <td>
                                                {
                                                    item.id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.code
                                                }
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </DataTable>

                    </ManagementContainer>
                )}

                {/* =================================================
                    ASSIGNMENTS
                ================================================= */}

                {showAssignmentManagement && (
                    <ManagementContainer
                        title="Assign Subject to Teacher"
                        onBack={() =>
                            setShowAssignmentManagement(
                                false
                            )
                        }
                    >

                        <form
                            onSubmit={
                                handleCreateAssignment
                            }
                            style={
                                formStyle
                            }
                        >

                            <h3>
                                New Assignment
                            </h3>

                            <label>
                                Teacher
                            </label>

                            <select
                                value={
                                    assignmentTeacherId
                                }
                                onChange={(e) =>
                                    setAssignmentTeacherId(
                                        e.target.value
                                    )
                                }
                                style={
                                    inputStyle
                                }
                                required
                            >

                                <option value="">
                                    Select Teacher
                                </option>

                                {teachers.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.name
                                            }{" "}
                                            -{" "}
                                            {
                                                item.email
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <label>
                                Subject
                            </label>

                            <select
                                value={
                                    assignmentSubjectId
                                }
                                onChange={(e) =>
                                    setAssignmentSubjectId(
                                        e.target.value
                                    )
                                }
                                style={
                                    inputStyle
                                }
                                required
                            >

                                <option value="">
                                    Select Subject
                                </option>

                                {subjects.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.code
                                            }{" "}
                                            -{" "}
                                            {
                                                item.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <label>
                                Class
                            </label>

                            <select
                                value={
                                    assignmentClassId
                                }
                                onChange={(e) =>
                                    setAssignmentClassId(
                                        e.target.value
                                    )
                                }
                                style={
                                    inputStyle
                                }
                                required
                            >

                                <option value="">
                                    Select Class
                                </option>

                                {classes.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.department_code
                                            }{" "}
                                            - Year{" "}
                                            {
                                                item.year
                                            }{" "}
                                            - Section{" "}
                                            {
                                                item.section
                                            }{" "}
                                            -{" "}
                                            {
                                                item.academic_year
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <button
                                type="submit"
                                disabled={
                                    assignmentLoading
                                }
                                style={
                                    primaryButtonStyle
                                }
                            >
                                {assignmentLoading
                                    ? "Assigning..."
                                    : "Assign Subject"}
                            </button>

                            {assignmentMessage && (
                                <p
                                    style={{
                                        color:
                                            assignmentMessage.includes(
                                                "successfully"
                                            )
                                                ? "green"
                                                : "red"
                                    }}
                                >
                                    {
                                        assignmentMessage
                                    }
                                </p>
                            )}

                        </form>

                        <h3>
                            Existing Teacher Assignments
                        </h3>

                        <DataTable>

                            <thead>
                                <tr>
                                    <th>
                                        Teacher
                                    </th>
                                    <th>
                                        Subject
                                    </th>
                                    <th>
                                        Class
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {assignments.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <tr
                                            key={
                                                getAssignmentId(
                                                    item
                                                ) ||
                                                index
                                            }
                                        >

                                            <td>
                                                {
                                                    item.teacher_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.subject_code
                                                }{" "}
                                                -{" "}
                                                {
                                                    item.subject_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.department_code
                                                }{" "}
                                                - Year{" "}
                                                {
                                                    item.year
                                                }{" "}
                                                - Section{" "}
                                                {
                                                    item.section
                                                }{" "}
                                                -{" "}
                                                {
                                                    item.academic_year
                                                }
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </DataTable>

                    </ManagementContainer>
                )}

            </div>
        );
    }

    // =========================================================
    // TEACHER DASHBOARD
    // =========================================================

    if (user.role === "TEACHER") {
        return (
            <div style={pageStyle}>

                <div
                    style={{
                        ...headerStyle,
                        borderLeft: "5px solid #2563eb"
                    }}
                >

                    <div>
                        <h1 style={dashboardTitleStyle}>
                            Teacher Dashboard
                        </h1>

                        <p style={dashboardWelcomeStyle}>
                            Welcome,{" "}
                            {
                                user.name
                            }
                        </p>
                    </div>

                    <button
                        onClick={
                            handleLogout
                        }
                        style={
                            logoutButtonStyle
                        }
                    >
                        Logout
                    </button>

                </div>

                {/* =================================================
                    TEACHER HOME
                ================================================= */}

                {!showTeacherClasses &&
                    !showTeacherSubjects &&
                    !showTakeAttendance && (

                        <div
                            style={{
                                maxWidth: "1400px",
                                margin: "0 auto"
                            }}
                        >

                            <h2
                                style={{
                                    ...sectionTitleStyle,
                                    marginBottom: "22px"
                                }}
                            >
                                Teacher Menu
                            </h2>

                            <div
                                style={
                                    cardGridStyle
                                }
                            >

                                <DashboardCard
                                    title="My Classes"
                                    description="View classes assigned to you"
                                    onClick={
                                        openTeacherClasses
                                    }
                                />

                                <DashboardCard
                                    title="My Subjects"
                                    description="View subjects assigned to you"
                                    onClick={
                                        openTeacherSubjects
                                    }
                                />

                                <DashboardCard
                                    title="Take Attendance"
                                    description="Create a session and mark attendance"
                                    onClick={
                                        openTakeAttendance
                                    }
                                />

                                <DashboardCard
                                    title="Attendance History"
                                    description="View previous attendance"
                                    onClick={
                                        openTeacherAttendanceHistory
                                    }
                                />

                            </div>

                        </div>
                    )}

                {/* =================================================
                    MY CLASSES
                ================================================= */}

                {showTeacherClasses && (
                    <ManagementContainer
                        title="My Classes"
                        onBack={() =>
                            setShowTeacherClasses(
                                false
                            )
                        }
                    >

                        {teacherAssignmentLoading && (
                            <p>
                                Loading...
                            </p>
                        )}

                        {teacherAssignmentMessage && (
                            <p
                                style={{
                                    color:
                                        "red"
                                }}
                            >
                                {
                                    teacherAssignmentMessage
                                }
                            </p>
                        )}

                        {!teacherAssignmentLoading &&
                            teacherAssignments.length ===
                                0 && (
                                <p>
                                    No classes assigned yet.
                                </p>
                            )}

                        <div
                            style={{
                                display:
                                    "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(280px, 1fr))",
                                gap:
                                    "20px"
                            }}
                        >

                            {teacherAssignments.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <div
                                        key={
                                            getAssignmentId(
                                                item
                                            ) ||
                                            index
                                        }
                                        style={
                                            infoCardStyle
                                        }
                                    >

                                        <h3>
                                            {
                                                item.department_code ||
                                                item.department_name
                                            }
                                        </h3>

                                        <p>
                                            <strong>
                                                Subject:
                                            </strong>{" "}
                                            {
                                                item.subject_name
                                            }
                                        </p>

                                        <p>
                                            <strong>
                                                Code:
                                            </strong>{" "}
                                            {
                                                item.subject_code
                                            }
                                        </p>

                                        <p>
                                            <strong>
                                                Year:
                                            </strong>{" "}
                                            {
                                                item.year
                                            }
                                        </p>

                                        <p>
                                            <strong>
                                                Section:
                                            </strong>{" "}
                                            {
                                                item.section
                                            }
                                        </p>

                                        <p>
                                            <strong>
                                                Academic Year:
                                            </strong>{" "}
                                            {
                                                item.academic_year
                                            }
                                        </p>

                                    </div>
                                )
                            )}

                        </div>

                    </ManagementContainer>
                )}

                {/* =================================================
                    MY SUBJECTS
                ================================================= */}

                {showTeacherSubjects && (
                    <ManagementContainer
                        title="My Subjects"
                        onBack={() =>
                            setShowTeacherSubjects(
                                false
                            )
                        }
                    >

                        {teacherAssignmentLoading && (
                            <p>
                                Loading...
                            </p>
                        )}

                        {teacherAssignmentMessage && (
                            <p
                                style={{
                                    color:
                                        "red"
                                }}
                            >
                                {
                                    teacherAssignmentMessage
                                }
                            </p>
                        )}

                        <DataTable>

                            <thead>
                                <tr>
                                    <th>
                                        Subject
                                    </th>
                                    <th>
                                        Code
                                    </th>
                                    <th>
                                        Class
                                    </th>
                                    <th>
                                        Year
                                    </th>
                                    <th>
                                        Section
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {teacherAssignments.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <tr
                                            key={
                                                getAssignmentId(
                                                    item
                                                ) ||
                                                index
                                            }
                                        >

                                            <td>
                                                {
                                                    item.subject_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.subject_code
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.department_code ||
                                                    item.department_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.year
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.section
                                                }
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </DataTable>

                    </ManagementContainer>
                )}

                {/* =================================================
                    ATTENDANCE HISTORY
                ================================================= */}

                {showTeacherAttendanceHistory && (
                    <ManagementContainer
                        title="Attendance History"
                        onBack={() =>
                            setShowTeacherAttendanceHistory(false)
                        }
                    >
                        {teacherAttendanceHistoryLoading && (
                            <p>Loading attendance history...</p>
                        )}

                        {teacherAttendanceHistoryMessage && (
                            <p style={{ color: "red" }}>
                                {teacherAttendanceHistoryMessage}
                            </p>
                        )}

                        {!teacherAttendanceHistoryLoading &&
                            !teacherAttendanceHistoryMessage &&
                            teacherAttendanceHistory.length === 0 && (
                                <p>No previous attendance sessions found.</p>
                            )}

                        {!teacherAttendanceHistoryLoading &&
                            teacherAttendanceHistory.length > 0 && (
                                <DataTable>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Subject</th>
                                            <th>Class</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>Total</th>
                                            <th>Present</th>
                                            <th>Absent</th>
                                            <th>Late</th>
                                            <th>Attendance %</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {teacherAttendanceHistory.map(
                                            (session, index) => (
                                                <tr
                                                    key={
                                                        session.session_id ||
                                                        index
                                                    }
                                                >
                                                    <td>
                                                        {session.session_date
                                                            ? new Date(
                                                                  session.session_date
                                                              ).toLocaleDateString()
                                                            : "-"}
                                                    </td>

                                                    <td>
                                                        {session.subject_code ||
                                                            ""}
                                                        {session.subject_code &&
                                                            session.subject_name
                                                            ? " - "
                                                            : ""}
                                                        {session.subject_name ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {(session.department_code ||
                                                            session.department_name ||
                                                            "-") +
                                                            " " +
                                                            (session.year ||
                                                                "") +
                                                            (session.section
                                                                ? `-${session.section}`
                                                                : "")}
                                                    </td>

                                                    <td>
                                                        {session.start_time ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {session.end_time ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {session.total_marked}
                                                    </td>

                                                    <td>
                                                        {session.present_count}
                                                    </td>

                                                    <td>
                                                        {session.absent_count}
                                                    </td>

                                                    <td>
                                                        {session.late_count}
                                                    </td>

                                                    <td>
                                                        {session.attendance_percentage}%
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </DataTable>
                            )}
                    </ManagementContainer>
                )}

                {/* =================================================
                    TAKE ATTENDANCE
                ================================================= */}

                {showTakeAttendance && (
                    <ManagementContainer
                        title="Take Attendance"
                        onBack={() =>
                            setShowTakeAttendance(
                                false
                            )
                        }
                    >

                        <div
                            style={
                                formStyle
                            }
                        >

                            <h3>
                                Today's Attendance
                            </h3>

                            <label>
                                Select Subject / Class
                            </label>

                            <select
                                value={
                                    selectedAttendanceAssignment
                                }
                                onChange={(e) =>
                                    handleAttendanceAssignmentChange(
                                        e.target.value
                                    )
                                }
                                style={
                                    inputStyle
                                }
                            >

                                <option value="">
                                    Select Subject and Class
                                </option>

                                {attendanceAssignments.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <option
                                            key={
                                                getAssignmentId(
                                                    item
                                                ) ||
                                                index
                                            }
                                            value={
                                                getAssignmentId(
                                                    item
                                                )
                                            }
                                        >
                                            {
                                                item.subject_code
                                            }{" "}
                                            -{" "}
                                            {
                                                item.subject_name
                                            }{" "}
                                            |{" "}
                                            {
                                                item.department_code ||
                                                item.department_name
                                            }{" "}
                                            Year{" "}
                                            {
                                                item.year
                                            }{" "}
                                            Section{" "}
                                            {
                                                item.section
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            {attendanceLoading && (
                                <p>
                                    Loading...
                                </p>
                            )}

                            {attendanceMessage && (
                                <p
                                    style={{
                                        color:
                                            attendanceMessage.includes(
                                                "successfully"
                                            )
                                                ? "green"
                                                : "red",
                                        fontWeight:
                                            "bold"
                                    }}
                                >
                                    {
                                        attendanceMessage
                                    }
                                </p>
                            )}

                            {selectedAttendanceAssignment &&
                                !attendanceSession &&
                                !endedAttendanceSession && (
                                    <button
                                        onClick={
                                            createAttendanceSession
                                        }
                                        disabled={
                                            attendanceLoading
                                        }
                                        style={
                                            primaryButtonStyle
                                        }
                                    >
                                        Create / Load Today's Attendance Session
                                    </button>
                                )}

                            {selectedAttendanceAssignment &&
                                endedAttendanceSession && (
                                    <div
                                        style={{
                                            background: "#fff3cd",
                                            border: "1px solid #ffe69c",
                                            padding: "18px",
                                            borderRadius: "10px",
                                            marginTop: "15px"
                                        }}
                                    >
                                        <h3
                                            style={{
                                                marginTop: 0,
                                                color: "#856404"
                                            }}
                                        >
                                            Today's Session Has Ended
                                        </h3>

                                        <p
                                            style={{
                                                color: "#856404"
                                            }}
                                        >
                                            This is the same attendance session. Reopening it will preserve students already marked PRESENT and keep the remaining students ABSENT.
                                        </p>

                                        <button
                                            onClick={
                                                reopenAttendanceSession
                                            }
                                            disabled={
                                                attendanceLoading
                                            }
                                            style={
                                                primaryButtonStyle
                                            }
                                        >
                                            Reopen Today's Session
                                        </button>
                                    </div>
                                )}

                        </div>

                        {/* =================================================
                            ACTIVE SESSION
                        ================================================= */}

                        {attendanceSession && (
                            <div
                                style={{
                                    background:
                                        "#e8f5e9",
                                    padding:
                                        "20px",
                                    borderRadius:
                                        "10px",
                                    marginBottom:
                                        "25px"
                                }}
                            >

                                <h3>
                                    Attendance Session Active
                                </h3>

                                <p>
                                    Session ID:{" "}
                                    {
                                        attendanceSession.id ??
                                        attendanceSession.session_id ??
                                        attendanceSession.sessionId
                                    }
                                </p>

                                <p>
                                    You can now mark attendance for the students below.
                                </p>

                            </div>
                        )}

                        {/* =================================================
                            FACE RECOGNITION
                        ================================================= */}

                        {attendanceSession && (
                            <div
                                style={{
                                    background:
                                        "#f5f5f5",
                                    padding:
                                        "20px",
                                    borderRadius:
                                        "10px",
                                    marginBottom:
                                        "25px",
                                    textAlign:
                                        "center"
                                }}
                            >
                                <h3>
                                    AI Face Recognition
                                </h3>

                                <p>
                                    Use the camera to recognize a registered student and automatically mark them PRESENT.
                                </p>

                                {!recognitionCameraOpen && (
                                    <button
                                        type="button"
                                        onClick={
                                            openRecognitionCamera
                                        }
                                        style={
                                            primaryButtonStyle
                                        }
                                    >
                                        Open Attendance Camera
                                    </button>
                                )}

                                {recognitionMessage && (
                                    <p
                                        style={{
                                            color:
                                                recognitionMessage.includes(
                                                    "successfully"
                                                )
                                                    ? "green"
                                                    : "red",
                                            fontWeight:
                                                "bold"
                                        }}
                                    >
                                        {
                                            recognitionMessage
                                        }
                                    </p>
                                )}

                                {recognizedStudent && (
                                    <div
                                        style={{
                                            marginTop:
                                                "15px",
                                            padding:
                                                "12px",
                                            backgroundColor:
                                                "#e8f5e9",
                                            borderRadius:
                                                "8px"
                                        }}
                                    >
                                        <strong>
                                            Recognized:
                                        </strong>{" "}
                                        {
                                            recognizedStudent.name
                                        }{" "}
                                        (
                                        {
                                            recognizedStudent.roll_number
                                        }
                                        )
                                    </div>
                                )}

                                {recognitionCameraOpen && (
                                    <div
                                        style={{
                                            marginTop:
                                                "20px"
                                        }}
                                    >
                                        <video
                                            ref={
                                                recognitionVideoRef
                                            }
                                            autoPlay
                                            playsInline
                                            muted
                                            style={{
                                                width:
                                                    "100%",
                                                maxWidth:
                                                    "640px",
                                                borderRadius:
                                                    "10px",
                                                backgroundColor:
                                                    "#000"
                                            }}
                                        />

                                        <canvas
                                            ref={
                                                recognitionCanvasRef
                                            }
                                            style={{
                                                display:
                                                    "none"
                                            }}
                                        />

                                        <div
                                            style={{
                                                marginTop:
                                                    "15px",
                                                display:
                                                    "flex",
                                                gap:
                                                    "10px",
                                                justifyContent:
                                                    "center",
                                                flexWrap:
                                                    "wrap"
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={
                                                    captureAndRecognizeFace
                                                }
                                                disabled={
                                                    recognitionScanning
                                                }
                                                style={
                                                    primaryButtonStyle
                                                }
                                            >
                                                {
                                                    recognitionScanning
                                                        ? "Recognizing..."
                                                        : "Scan Face"
                                                }
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    stopRecognitionCamera
                                                }
                                                disabled={
                                                    recognitionScanning
                                                }
                                                style={
                                                    logoutButtonStyle
                                                }
                                            >
                                                Close Camera
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* =================================================
                            STUDENTS
                        ================================================= */}

                        {attendanceStudents.length >
                            0 && (
                            <div>

                                <h3>
                                    Students
                                </h3>

                                <DataTable>

                                    <thead>
                                        <tr>
                                            <th>
                                                Roll Number
                                            </th>

                                            <th>
                                                Student Name
                                            </th>

                                            <th>
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {attendanceStudents.map(
                                            (
                                                student
                                            ) => {

                                                const studentId =
                                                    student.id ??
                                                    student.student_id;

                                                return (
                                                    <tr
                                                        key={
                                                            studentId
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                student.roll_number
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                student.name
                                                            }
                                                        </td>

                                                        <td>

                                                            <span
                                                                style={{
                                                                    display: "inline-block",
                                                                    padding: "8px 14px",
                                                                    borderRadius: "6px",
                                                                    backgroundColor:
                                                                        attendanceStatuses[studentId] === "PRESENT"
                                                                            ? "#e8f5e9"
                                                                            : "#f5f5f5",
                                                                    color:
                                                                        attendanceStatuses[studentId] === "PRESENT"
                                                                            ? "green"
                                                                            : "#555",
                                                                    fontWeight: "bold"
                                                                }}
                                                            >
                                                                {attendanceStatuses[studentId] || "Not marked"}
                                                            </span>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </DataTable>

                                <div
                                    style={{
                                        marginTop:
                                            "25px",
                                        display:
                                            "flex",
                                        gap:
                                            "15px"
                                    }}
                                >



                                    <button
                                        onClick={
                                            endAttendanceSession
                                        }
                                        disabled={
                                            attendanceLoading
                                        }
                                        style={
                                            endSessionButtonStyle
                                        }
                                    >
                                        End Session
                                    </button>

                                </div>

                            </div>
                        )}

                    </ManagementContainer>
                )}

            </div>
        );
    }

    // =========================================================
    // STUDENT DASHBOARD
    // =========================================================

    if (user.role === "STUDENT") {
        return (
            <div style={pageStyle}>

                <div style={headerStyle}>

                    <div>
                        <h1>
                            Student Dashboard
                        </h1>

                        <p>
                            Welcome,{" "}
                            {
                                user.name
                            }
                        </p>
                    </div>

                    <button
                        onClick={
                            handleLogout
                        }
                        style={
                            logoutButtonStyle
                        }
                    >
                        Logout
                    </button>

                </div>

                {!showStudentAttendance && (
                    <div>

                        <h2>
                            Student Menu
                        </h2>

                        <div
                            style={
                                cardGridStyle
                            }
                        >

                            <DashboardCard
                                title="My Attendance"
                                description="View your overall attendance"
                                onClick={
                                    openStudentAttendance
                                }
                            />

                            <DashboardCard
                                title="Subject-wise Attendance"
                                description="View attendance for each subject"
                                onClick={
                                    openStudentAttendance
                                }
                            />

                            <DashboardCard
                                title="Attendance History"
                                description="View your attendance history"
                                onClick={
                                    openStudentAttendance
                                }
                            />

                        </div>

                    </div>
                )}

                {showStudentAttendance && (
                    <ManagementContainer
                        title="My Attendance"
                        onBack={() =>
                            setShowStudentAttendance(
                                false
                            )
                        }
                    >

                        {studentAttendanceLoading && (
                            <p>
                                Loading attendance...
                            </p>
                        )}

                        {studentAttendance &&
                            !studentAttendanceLoading && (

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(220px, 1fr))",
                                        gap:
                                            "20px"
                                    }}
                                >

                                    <div
                                        style={
                                            infoCardStyle
                                        }
                                    >

                                        <h3>
                                            Total Sessions
                                        </h3>

                                        <p
                                            style={{
                                                fontSize:
                                                    "32px",
                                                fontWeight:
                                                    "bold"
                                            }}
                                        >
                                            {
                                                studentAttendance.total_sessions
                                            }
                                        </p>

                                    </div>

                                    <div
                                        style={
                                            infoCardStyle
                                        }
                                    >

                                        <h3>
                                            Attended
                                        </h3>

                                        <p
                                            style={{
                                                fontSize:
                                                    "32px",
                                                fontWeight:
                                                    "bold"
                                            }}
                                        >
                                            {
                                                studentAttendance.attended_sessions
                                            }
                                        </p>

                                    </div>

                                    <div
                                        style={
                                            infoCardStyle
                                        }
                                    >

                                        <h3>
                                            Attendance %
                                        </h3>

                                        <p
                                            style={{
                                                fontSize:
                                                    "32px",
                                                fontWeight:
                                                    "bold"
                                            }}
                                        >
                                            {
                                                studentAttendance.attendance_percentage
                                            }
                                            %
                                        </p>

                                    </div>

                                </div>
                            )}

                            {/* =================================================
                                SUBJECT-WISE ATTENDANCE
                            ================================================= */}

                            {!studentAttendanceLoading && (
                                <div
                                    style={{
                                        marginTop:
                                            "30px"
                                    }}
                                >
                                    <h3>
                                        Subject-wise Attendance
                                    </h3>

                                    {studentSubjectAttendance.length === 0 ? (
                                        <p>
                                            No subject-wise attendance records found.
                                        </p>
                                    ) : (
                                        <DataTable>
                                            <thead>
                                                <tr>
                                                    <th>Subject</th>
                                                    <th>Code</th>
                                                    <th>Total Sessions</th>
                                                    <th>Attended</th>
                                                    <th>Attendance %</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {studentSubjectAttendance.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                item.subject_id ||
                                                                item.id ||
                                                                index
                                                            }
                                                        >
                                                            <td>
                                                                {
                                                                    item.subject_name
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    item.subject_code
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    item.total_sessions
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    item.attended_sessions
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    item.attendance_percentage
                                                                }
                                                                %
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </DataTable>
                                    )}
                                </div>
                            )}

                            {/* =================================================
                                ATTENDANCE HISTORY
                            ================================================= */}

                            {!studentAttendanceLoading && (
                                <div
                                    style={{
                                        marginTop:
                                            "30px"
                                    }}
                                >
                                    <h3>
                                        Attendance History
                                    </h3>

                                    {studentAttendanceHistory.length === 0 ? (
                                        <p>
                                            No attendance history found.
                                        </p>
                                    ) : (
                                        <DataTable>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Subject</th>
                                                    <th>Code</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {studentAttendanceHistory.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                item.attendance_id ||
                                                                item.id ||
                                                                index
                                                            }
                                                        >
                                                            <td>
                                                                {
                                                                    item.session_date
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    item.subject_name
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    item.subject_code
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    item.status
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </DataTable>
                                    )}
                                </div>
                            )}

                    </ManagementContainer>
                )}

            </div>
        );
    }

    return null;
}


// =========================================================
// DASHBOARD CARD
// =========================================================

function DashboardCard({
    title,
    description,
    onClick
}) {
    return (
        <div
            onClick={onClick}
            style={{
                background:
                    "white",
                padding:
                    "28px 24px",
                borderRadius:
                    "16px",
                boxShadow:
                    "0 6px 20px rgba(15, 23, 42, 0.08)",
                border:
                    "1px solid #e5e7eb",
                cursor:
                    "pointer",
                minHeight:
                    "190px",
                display:
                    "flex",
                flexDirection:
                    "column",
                justifyContent:
                    "space-between",
                transition:
                    "transform 0.2s ease, box-shadow 0.2s ease"
            }}
        >

            <h3
                style={{
                    margin:
                        "0 0 12px",
                    color:
                        "#1e293b",
                    fontSize:
                        "21px",
                    fontWeight:
                        "700"
                }}
            >
                {title}
            </h3>

            <p
                style={{
                    color:
                        "#64748b",
                    lineHeight:
                        "1.6",
                    margin:
                        "0 0 20px",
                    fontSize:
                        "15px"
                }}
            >
                {description}
            </p>

            <button
                style={
                    primaryButtonStyle
                }
            >
                Open
            </button>

        </div>
    );
}


// =========================================================
// MANAGEMENT CONTAINER
// =========================================================

function ManagementContainer({
    title,
    onBack,
    children
}) {
    return (
        <div>

            <button
                onClick={onBack}
                style={
                    backButtonStyle
                }
            >
                ← Back to Dashboard
            </button>

            <h2>
                {title}
            </h2>

            {children}

        </div>
    );
}


// =========================================================
// DATA TABLE
// =========================================================

function DataTable({
    children
}) {
    return (
        <div
            style={{
                overflowX:
                    "auto",
                background:
                    "white",
                borderRadius:
                    "10px",
                marginTop:
                    "20px"
            }}
        >

            <table
                style={{
                    width:
                        "100%",
                    borderCollapse:
                        "collapse"
                }}
            >
                {children}
            </table>

            <style>
                {`
                    th, td {
                        padding: 12px;
                        border-bottom: 1px solid #ddd;
                        text-align: left;
                    }

                    th {
                        background: #f2f4f7;
                    }
                `}
            </style>

        </div>
    );
}


// =========================================================
// STYLES
// =========================================================

const loginPageStyle = {
    minHeight:
        "100vh",
    background:
        "#f4f6f8",
    display:
        "flex",
    justifyContent:
        "center",
    alignItems:
        "center",
    fontFamily:
        "Arial"
};

const loginBoxStyle = {
    width:
        "400px",
    background:
        "white",
    padding:
        "35px",
    borderRadius:
        "12px",
    boxShadow:
        "0 4px 20px rgba(0,0,0,0.1)"
};

const pageStyle = {
    minHeight:
        "100vh",
    background:
        "#eef2f7",
    padding:
        "32px",
    fontFamily:
        "Arial",
    color:
        "#1e293b",
    boxSizing:
        "border-box"
};

const headerStyle = {
    maxWidth:
        "1400px",
    margin:
        "0 auto 32px",
    padding:
        "24px 28px",
    background:
        "white",
    borderRadius:
        "16px",
    boxShadow:
        "0 6px 20px rgba(15, 23, 42, 0.07)",
    border:
        "1px solid #e5e7eb",
    display:
        "flex",
    justifyContent:
        "space-between",
    alignItems:
        "center"
};

const dashboardTitleStyle = {
    margin:
        "0 0 8px",
    color:
        "#0f172a",
    fontSize:
        "32px",
    fontWeight:
        "700"
};

const dashboardWelcomeStyle = {
    margin:
        "0",
    color:
        "#64748b",
    fontSize:
        "16px"
};

const sectionTitleStyle = {
    maxWidth:
        "1400px",
    margin:
        "0 auto 20px",
    color:
        "#0f172a",
    fontSize:
        "22px",
    fontWeight:
        "700"
};

const cardGridStyle = {
    maxWidth:
        "1400px",
    margin:
        "0 auto",
    display:
        "grid",
    gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
    gap:
        "22px"
};

const formStyle = {
    background:
        "white",
    padding:
        "25px",
    borderRadius:
        "10px",
    maxWidth:
        "600px",
    marginBottom:
        "30px",
    boxShadow:
        "0 3px 12px rgba(0,0,0,0.08)"
};

const inputStyle = {
    width:
        "100%",
    padding:
        "12px",
    marginTop:
        "8px",
    marginBottom:
        "15px",
    border:
        "1px solid #ccc",
    borderRadius:
        "6px",
    boxSizing:
        "border-box",
    fontSize:
        "15px"
};

const primaryButtonStyle = {
    background:
        "#2563eb",
    color:
        "white",
    border:
        "none",
    padding:
        "11px 22px",
    borderRadius:
        "8px",
    cursor:
        "pointer",
    fontSize:
        "15px",
    fontWeight:
        "600",
    alignSelf:
        "flex-start"
};

const logoutButtonStyle = {
    background:
        "#dc2626",
    color:
        "white",
    border:
        "none",
    padding:
        "10px 18px",
    borderRadius:
        "6px",
    cursor:
        "pointer"
};

const backButtonStyle = {
    background:
        "#555",
    color:
        "white",
    border:
        "none",
    padding:
        "10px 18px",
    borderRadius:
        "6px",
    cursor:
        "pointer",
    marginBottom:
        "20px"
};

const endSessionButtonStyle = {
    background:
        "#dc2626",
    color:
        "white",
    border:
        "none",
    padding:
        "12px 20px",
    borderRadius:
        "6px",
    cursor:
        "pointer",
    fontSize:
        "15px"
};

const infoCardStyle = {
    background:
        "white",
    padding:
        "25px",
    borderRadius:
        "12px",
    boxShadow:
        "0 3px 12px rgba(0,0,0,0.08)"
};


export default App;