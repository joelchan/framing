#!/usr/bin/env python2

import mturk

if __name__ == '__main__':
    m = mturk.MechanicalTurk()
    r = m.request("GetAccountBalance")
    if r.valid:
        print r.get_response_element("AvailableBalance")
    r = m.request("ApproveRejectedAssignment",
        {"AssignmentId": "3W92K5RLWUH9521WKZQ16PDEGN45VF",
        "RequesterFeedback": "System error caused activity not to be logged and credit was not initially given"})
    if r.valid:
        print r.get_response_element("ApproveRejectedAssignmentResult")
    else:
        print "failed"
