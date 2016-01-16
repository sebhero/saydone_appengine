package com.boreback.saydone.entity;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.oauth.OAuthRequestException;
import com.google.appengine.api.users.User;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;


import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.List;

//import javax.jdo.Query;
//import java.util.prefs.Preferences;

@Api(name = "taskitemendpoint", namespace = @ApiNamespace(ownerDomain = "say-done.appspot.com", ownerName = "say-done.appspot.com", packagePath = "saydone.entity"))
public class TaskItemEndpoint {

    //User testUser = new User("example@example.com", "gmail.com");



//    @ApiMethod(name = "insertTaskItem", scopes = { Constants.EMAIL_SCOPE }, clientIds = {
//            Constants.WEB_CLIENT_ID,
//            com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
//    public TaskItem insertTaskItem(TaskItem taskitem, User user)
//            throws UnauthorizedException {
//
//        if (user == null)
//            throw new UnauthorizedException("User is Not Valid");


        /**
         * This method lists all the entities inserted in datastore. It uses HTTP
         * GET method and paging support.
         *
         * @return A CollectionResponse class containing the list of all entities
         *         persisted and a cursor to the next page.
         */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listTaskItem", scopes = { Constants.EMAIL_SCOPE }, clientIds = {
            Constants.WEB_CLIENT_ID,
            com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public CollectionResponse<TaskItem> listTaskItem(
            @Nullable @Named("cursor") String cursorString,
            @Nullable @Named("limit") Integer limit,
            User user) throws UnauthorizedException {

            if (user == null)
            throw new UnauthorizedException("User is Not Valid");


        PersistenceManager mgr = null;
		Cursor cursor = null;
		List<TaskItem> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(TaskItem.class);
            //Query based on userid
            query.setFilter("userID == '"+user.getUserId()+"'");
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<TaskItem>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and
			// accomodate
			// for lazy fetch.
			for (TaskItem obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<TaskItem> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET
	 * method.
	 *
	 * @param id
	 *            the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getTaskItem")
	public TaskItem getTaskItem(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		TaskItem taskitem = null;
		try {
			taskitem = mgr.getObjectById(TaskItem.class, id);
		} finally {
			mgr.close();
		}
        System.out.println("Taskitem owner "+taskitem.getOwnerUser().getEmail());
        return taskitem;
	}

    class StringResponse {
        String value;

        StringResponse(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }



    }

    //custom function on restpoint
//    @ApiMethod(name = "getUser",  scopes = { Constants.EMAIL_SCOPE},
//            clientIds = { Constants.WEB_CLIENT_ID,
//            com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
//	public StringResponse getUser(User user) throws UnauthorizedException, OAuthRequestException {
//
//        if (user == null)
//        {
//            System.out.println("not logged in!!");
//            throw new UnauthorizedException("User is Not Valid");
//        }
//        //UserService userService = UserServiceFactory.getUserService();
//        UserService userService = UserServiceFactory.getUserService();
//
//
//        boolean adminUser =userService.isUserAdmin();
//
//
////        boolean adminUser = userService.isUserAdmin();
//		return new StringResponse(user.getEmail()+" is admin: "+adminUser);
//	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity
	 * already exists in the datastore, an exception is thrown. It uses HTTP
	 * POST method.
	 *
	 * @param taskitem
	 *            the entity to be inserted.
	 * @return The inserted entity.
	 * @throws UnauthorizedException
	 */
	@ApiMethod(name = "insertTaskItem", scopes = { Constants.EMAIL_SCOPE }, clientIds = {
			Constants.WEB_CLIENT_ID,
			com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public TaskItem insertTaskItem(TaskItem taskitem, User user)
			throws UnauthorizedException {

		if (user == null)
			throw new UnauthorizedException("User is Not Valid");

        taskitem.setOwnerUser(user);
        taskitem.setUserID(user.getUserId());
        System.out.println("task Serveruser is "+taskitem.getOwnerUser());

		PersistenceManager mgr = getPersistenceManager();
		try {
            //add if is a new one
            if(taskitem.getId() != null)
            {
                if (containsTaskItem(taskitem)) {
                    throw new EntityExistsException("Object already exists");
                }
            }
			mgr.makePersistent(taskitem);
		} finally {
			mgr.close();
		}
		return taskitem;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does
	 * not exist in the datastore, an exception is thrown. It uses HTTP PUT
	 * method.
	 *
	 * @param taskitem
	 *            the entity to be updated.
	 * @return The updated entity.
	 */
//	@ApiMethod(name = "updateTaskItem", scopes = { Constants.EMAIL_SCOPE }, clientIds = {
//			Constants.WEB_CLIENT_ID,
//			com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
    @ApiMethod(name = "updateTaskItem", scopes = {  Constants.EMAIL_SCOPE },
            clientIds = { Constants.WEB_CLIENT_ID,
			com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public TaskItem updateTaskItem(TaskItem taskitem, User user)
            throws UnauthorizedException, OAuthRequestException {

		if (user == null)
			throw new UnauthorizedException("User is Not Valid");

        taskitem.setUserID(user.getUserId());
        taskitem.setOwnerUser(user);

		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsTaskItem(taskitem)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(taskitem);
		} finally {
			mgr.close();
		}
		return taskitem;
	}

	/**
	 * This method removes the entity with primary key id. It uses HTTP DELETE
	 * method.
	 *
	 * @param id
	 *            the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeTaskItem", scopes = { Constants.EMAIL_SCOPE }, clientIds = {
			Constants.WEB_CLIENT_ID,
			com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID })
	public void removeTaskItem(@Named("id") Long id, User user)
			throws UnauthorizedException {

		if (user == null)
			throw new UnauthorizedException("User is Not Valid");

		PersistenceManager mgr = getPersistenceManager();
		try {
			TaskItem taskitem = mgr.getObjectById(TaskItem.class, id);
			mgr.deletePersistent(taskitem);
		} finally {
			mgr.close();
		}
	}

	private boolean containsTaskItem(TaskItem taskitem) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(TaskItem.class, taskitem.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
