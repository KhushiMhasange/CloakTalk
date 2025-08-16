const Domains = [
    "iitkgp.ac.in", "iitb.ac.in", "iitm.ac.in", "iitk.ac.in", "iitd.ac.in",
    "iitg.ac.in", "iitr.ac.in", "iitbbs.ac.in", "iitgn.ac.in", "iith.ac.in",
    "iitj.ac.in", "iitp.ac.in", "iitrpr.ac.in", "iiti.ac.in", "iitmandi.ac.in",
    "iitbhu.ac.in", "iitpkd.ac.in", "iittp.ac.in", "iitism.ac.in", "iitbhilai.ac.in",
    "iitgoa.ac.in", "iitjammu.ac.in", "iitdh.ac.in", "iimidr.ac.in", "iiti.ac.in",
    "dauniv.ac.in", "sgsits.ac.in", "ietdavv.edu.in", "acropolis.in", "ipsacademy.org",
    "pimrindore.ac.in", "arihantcollege.ac.in", "astral.ac.in", "cdshindore.com",
    "davvmsdgc.org", "mlbcollegeindore.org", "indoreinstitute.com", "orientaluniversity.in",
    "cdgi.edu.in", "mitindore.com", "rishiraj.ac.in", "ies.ipsacademy.org",
    "govtmhowcollege.org", "gbscollege.ac.in", "brauss.in", "sageuniversity.in",
    "medicaps.ac.in", "svvv.edu.in"
];

//implement vaild email id check like is the email in correct format.
export default function checkDomain(email){
    const domain = email.split("@")[1];
    if(Domains.includes(domain)) return true;
    return false;
}


