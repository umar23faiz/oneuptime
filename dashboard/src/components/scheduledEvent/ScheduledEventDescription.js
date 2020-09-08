import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { openModal } from '../../actions/modal';
import { capitalize } from '../../config';
import ShouldRender from '../basic/ShouldRender';
import EditSchedule from '../modals/EditSchedule';

function ScheduledEventDescription({
    scheduledEvent,
    isOngoing,
    history,
    openModal,
    monitorList,
}) {
    const handleMonitorListing = (event, monitorState) => {
        const affectedMonitors = [];
        const eventMonitors = [];
        // populate the ids of the event monitors in an array
        event.monitors.map(monitor => {
            eventMonitors.push(String(monitor.monitorId._id));
            return monitor;
        });

        monitorState.map(monitor => {
            if (eventMonitors.includes(String(monitor._id))) {
                affectedMonitors.push(monitor);
            }
            return monitor;
        });

        // if they are equal then all the resources are affected
        if (affectedMonitors.length === monitorState.length) {
            return 'All Resources are affected';
        } else {
            return affectedMonitors.length <= 3
                ? affectedMonitors
                      .map(monitor => capitalize(monitor.name))
                      .join(', ')
                      .replace(/, ([^,]*)$/, ' and $1')
                : affectedMonitors.length > 3 &&
                      `${capitalize(affectedMonitors[0].name)}, ${capitalize(
                          affectedMonitors[1].name
                      )} and ${affectedMonitors.length - 2} other monitors.`;
        }
    };

    return (
        <div className="Box-root Margin-bottom--12">
            <div className="bs-ContentSection Card-root Card-shadow--medium">
                <div className="Box-root">
                    <div className="bs-ContentSection-content Box-root Box-divider--surface-bottom-1 Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--16">
                        <div className="Box-root">
                            <span className="Text-color--inherit Text-display--inline Text-fontSize--16 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                {isOngoing ? (
                                    <span>Ongoing Scheduled Event</span>
                                ) : (
                                    <span>Scheduled Event Description</span>
                                )}
                            </span>
                            <p>
                                <span>
                                    Here&#39;s a little more information about
                                    the scheduled event.
                                </span>
                            </p>
                        </div>
                        <div className="ContentHeader-end Box-root Flex-flex Flex-alignItems--center">
                            {isOngoing && (
                                <button
                                    className="Button bs-ButtonLegacy ActionIconParent"
                                    id="viewOngoingEvent"
                                    type="button"
                                    onClick={() =>
                                        history.push(
                                            `/dashboard/project/${scheduledEvent.projectId._id}/scheduledEvents/${scheduledEvent._id}`
                                        )
                                    }
                                >
                                    <span className="bs-Button">
                                        <span>View Event</span>
                                    </span>
                                </button>
                            )}
                            <button
                                id={`editScheduledEvent-${scheduledEvent.name}`}
                                title="delete"
                                className="bs-Button bs-DeprecatedButton db-Trends-editButton bs-Button--icon bs-Button--edit"
                                style={{
                                    marginLeft: 20,
                                }}
                                type="button"
                                onClick={() =>
                                    openModal({
                                        id: scheduledEvent._id,
                                        content: EditSchedule,
                                        event: scheduledEvent,
                                    })
                                }
                            >
                                <span>Edit</span>
                            </button>
                        </div>
                    </div>
                    <div className="bs-ContentSection-content Box-root Box-background--offset Box-divider--surface-bottom-1 Padding-horizontal--8 Padding-vertical--2">
                        <div>
                            <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2">
                                <fieldset className="bs-Fieldset">
                                    <div className="bs-Fieldset-rows">
                                        <div className="bs-Fieldset-row Flex-alignItems--center Flex-justifyContent--center">
                                            <label className="bs-Fieldset-label">
                                                Event Name
                                            </label>
                                            <div className="bs-Fieldset-fields">
                                                <span
                                                    className="value"
                                                    style={{ marginTop: '2px' }}
                                                >
                                                    {capitalize(
                                                        scheduledEvent.name
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <ShouldRender
                                            if={scheduledEvent.description}
                                        >
                                            <div className="bs-Fieldset-row Flex-alignItems--center Flex-justifyContent--center">
                                                <label className="bs-Fieldset-label">
                                                    Event Description
                                                </label>
                                                <div className="bs-Fieldset-fields">
                                                    <span
                                                        className="value"
                                                        style={{
                                                            marginTop: '2px',
                                                        }}
                                                    >
                                                        {
                                                            scheduledEvent.description
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </ShouldRender>
                                        <div className="bs-Fieldset-row Flex-alignItems--center Flex-justifyContent--center">
                                            <label className="bs-Fieldset-label">
                                                Affected Resources
                                            </label>
                                            <div className="bs-Fieldset-fields">
                                                <span
                                                    className="value"
                                                    style={{ marginTop: '2px' }}
                                                >
                                                    {handleMonitorListing(
                                                        scheduledEvent,
                                                        monitorList
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bs-Fieldset-row Flex-alignItems--center Flex-justifyContent--center">
                                            <label className="bs-Fieldset-label">
                                                Start Date
                                            </label>
                                            <div className="bs-Fieldset-fields">
                                                <span
                                                    className="value"
                                                    style={{ marginTop: '2px' }}
                                                >
                                                    {moment(
                                                        scheduledEvent.startDate
                                                    ).format(
                                                        'MMMM Do YYYY, h:mm:ss a'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bs-Fieldset-row Flex-alignItems--center Flex-justifyContent--center">
                                            <label className="bs-Fieldset-label">
                                                End Date
                                            </label>
                                            <div className="bs-Fieldset-fields">
                                                <span
                                                    className="value"
                                                    style={{ marginTop: '2px' }}
                                                >
                                                    {moment(
                                                        scheduledEvent.endDate
                                                    ).format(
                                                        'MMMM Do YYYY, h:mm:ss a'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className="bs-ContentSection-footer bs-ContentSection-content Box-root Box-background--white Flex-flex Flex-alignItems--center Flex-justifyContent--spaceBetween Padding-horizontal--20 Padding-vertical--12">
                        <span className="db-SettingsForm-footerMessage"></span>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

ScheduledEventDescription.displayName = 'ScheduledEventDescription';

ScheduledEventDescription.propTypes = {
    scheduledEvent: PropTypes.object,
    isOngoing: PropTypes.bool,
    history: PropTypes.object,
    openModal: PropTypes.func,
    monitorList: PropTypes.array,
};

ScheduledEventDescription.defaultProps = {
    isOngoing: false,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators({ openModal }, dispatch);

export default connect(
    null,
    mapDispatchToProps
)(withRouter(ScheduledEventDescription));
