package com.boreback.saydone.entity;

import com.google.api.server.spi.config.AnnotationBoolean;
import com.google.api.server.spi.config.ApiResourceProperty;
import com.google.appengine.api.users.User;

import javax.jdo.annotations.*;
import java.util.Date;

//from dropbox

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class TaskItem {

	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	Long id;
	// // parent id if its is a subtask or is a requirement for an other task
	// @Persistent
	// Long parentId;

	// the id in the browser, for the array in browser
	@Persistent
	int taskID;

	// title info about what is the task
	@Persistent
	String title;

	// // completed task
	// @Persistent
	// Date timeStamp;

	// time spent on task
	@Persistent
	Date minTime;
	// better name..
	// Date minTimeLasted;
	@Persistent
	Date maxTime;
	@Persistent
	Date avgTime;

	// totaletime spent on task
	@Persistent
	Date totalTime;
	// total times done the task
	@Persistent
	int totalDones;

    // task is complete
    @Persistent
    Boolean isDone = false;

    @Persistent
    Date timestamp;

    @Persistent
    String userID;

    //from server
	@Persistent
    @ApiResourceProperty(ignored = AnnotationBoolean.TRUE)
    User ownerUser;

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public User getOwnerUser() {
        return ownerUser;
    }

    public void setOwnerUser(User ownerUser) {
        this.ownerUser = ownerUser;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public int getTaskID() {
		return taskID;
	}

	public void setTaskID(int taskID) {
		this.taskID = taskID;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Date getMinTime() {
		return minTime;
	}

	public void setMinTime(Date minTime) {
		this.minTime = minTime;
	}

	public Date getMaxTime() {
		return maxTime;
	}

	public void setMaxTime(Date maxTime) {
		this.maxTime = maxTime;
	}

	public Date getAvgTime() {
		return avgTime;
	}

	public void setAvgTime(Date avgTime) {
		this.avgTime = avgTime;
	}

	public Date getTotalTime() {
		return totalTime;
	}

	public void setTotalTime(Date totalTime) {
		this.totalTime = totalTime;
	}

	public int getTotalDones() {
		return totalDones;
	}

	public void setTotalDones(int totalDones) {
		this.totalDones = totalDones;
	}

	public Boolean getIsDone() {
		return isDone;
	}

	public void setIsDone(Boolean isDone) {
		this.isDone = isDone;
	}

	/*
	 * TODO add skills (fint i hemmet (st�da), Mer muskler(tr�na),
	 * sj�lvf�rverklig, dansa and priority based on urgency interest reward
	 * effort cost
	 */

}
